import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import path from "node:path";

const metadataFiles = ["CHANGELOG.md", "package-lock.json", "package.json"];
const releaseSubject = /^chore\(release\): ((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)) \[skip ci\]$/;

function readGit(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

// Vercel runs this before npm install: use only Node built-ins and local Git.
// Fail open: missing history, unexpected files or any error must keep the build.
export function isReleaseMetadataOnly(git = readGit) {
  try {
    const match = git(["show", "-s", "--format=%s", "HEAD"]).trim().match(releaseSubject);
    if (!match) return false;
    const parents = git(["show", "-s", "--format=%P", "HEAD"]).trim().split(/\s+/).filter(Boolean);
    if (parents.length !== 1) return false;
    const files = git(["diff", "--name-only", "--no-renames", "-z", "HEAD^", "HEAD"])
      .split("\0").filter(Boolean).sort();
    if (!isDeepStrictEqual(files, metadataFiles)) return false;

    const previousPackage = JSON.parse(git(["show", "HEAD^:package.json"]));
    const nextPackage = JSON.parse(git(["show", "HEAD:package.json"]));
    const previousLock = JSON.parse(git(["show", "HEAD^:package-lock.json"]));
    const nextLock = JSON.parse(git(["show", "HEAD:package-lock.json"]));
    const version = match[1];
    if (nextPackage.version !== version || previousPackage.version === version) return false;
    if (previousLock.version !== previousPackage.version ||
        previousLock.packages[""].version !== previousPackage.version ||
        nextLock.version !== version || nextLock.packages[""].version !== version) return false;

    delete previousPackage.version;
    delete nextPackage.version;
    delete previousLock.version;
    delete nextLock.version;
    delete previousLock.packages[""].version;
    delete nextLock.packages[""].version;
    return isDeepStrictEqual(previousPackage, nextPackage) && isDeepStrictEqual(previousLock, nextLock);
  } catch {
    return false;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const skip = isReleaseMetadataOnly();
  console.log(skip ? "Skip build: release metadata only." : "Continue build: application change or unverified release metadata.");
  // Vercel's convention is intentionally the reverse of a usual success check.
  process.exitCode = skip ? 0 : 1;
}
