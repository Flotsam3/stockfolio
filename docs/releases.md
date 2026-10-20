# CI und semantische Releases

## Bestand und Entscheidung

Am 20.10.2026 geprüft: Next.js 16.3.3, React 19, TypeScript 5, ESLint 9 mit
Flat Config. Root-Paket und beide Versionsfelder im npm-Lockfile (Format 3)
stehen auf `1.1.0`. Keine Workspaces oder Backend-Unterpakete. Zu den drei
ursprünglichen Fundamentals-Tests kommen sieben Tests der Vercel-Ausnahme.

Remote-`main`: `780b031fb11c82872e339f3226505c3389aafd16`, dateigleich mit
lokalem Arbeitsbranch `fix/sf-07-typescript-build-gate` auf `64deb45`.
Lokales `main` und `origin/main` sind veraltet. Weiterhin keine lokalen oder
Remote-Tags und keine GitHub-Releases. Alle CI-/Release-Änderungen sind uncommittet.
Vor der Einrichtung gab es keine Actions-/Husky-/Commitlint-Konfigurationen.
Actions ist aktiviert, Standard-Tokenrechte: read. Für `main` wurden erneut
kein klassischer Branch-Schutz und keine wirksamen Branch-Regeln gefunden.
Der vorhandene Commitstatus heißt exakt `Vercel`.

Die bisherige Variante ohne Release-Commits wurde neu bewertet:

| Aspekt | Bisher: Tags und Release-Anhänge | Jetzt: Synchronisierung wie Exlingua/MacroMonitor |
| --- | --- | --- |
| Versionsdateien | Paketversion statisch `1.1.0` | Paket und Lockfile nach erfolgreichem Release aktuell |
| Changelog | Einzeldatei je GitHub-Release | Kumulativ im Repository und Versionstag |
| Git | Kein Bot-Push; Tag direkt am geprüften Commit | Ein Metadatencommit; direkte Bot-Push-Rechte nötig |
| Vercel | Kein Release-Commit-Trigger | Zusätzlicher Trigger möglich; Ignore-Schritt beendet dessen Build |
| Produktion | Tag entspricht Quellcommit | Tag einen Metadatencommit nach dem deployten Quellcommit |

Die Synchronisierung ist mit den folgenden Schutzmaßnahmen vertretbar und
umgesetzt. Ein Anspruch auf keinerlei zusätzliche Deployment-Einträge oder
Quotenverbrauch wäre damit nicht erfüllbar; dafür wäre die tagbasierte Variante
geeigneter. Keine Variante beweist allein die Freigabe auf Produktionsdomains.

## Release-Konfiguration

Nur `main`, Tagformat `v${version}`, Preset `conventionalcommits`. Reihenfolge:

1. Commit-Analyzer bestimmt den Sprung; Release-Notes-Generator erzeugt Notizen.
2. `@semantic-release/changelog` ergänzt das Root-`CHANGELOG.md`.
3. `@semantic-release/npm` mit **`npmPublish: false`** aktualisiert mittels
   `npm version --no-git-tag-version` die Version in Paket und Lockfile inklusive
   `packages[""].version`. Keine npm-Veröffentlichung, kein npm-Token nötig;
   `private: true` bleibt zusätzlich erhalten.
4. `@semantic-release/git` committet ausschließlich `CHANGELOG.md`, `package.json`
   und `package-lock.json` als `chore(release): ${nextRelease.version} [skip ci]`
   und pusht nach `main`.
5. semantic-release setzt den Versionstag auf den Metadatencommit und erstellt
   über das GitHub-Plugin den Release mit Release Notes.

Das Changelog liegt damit im markierten Repository-Stand; der bisherige gesonderte
Anhang entfällt. Es gibt keine `preversion`-/`version`-/`postversion`-Skripte,
die Anwendungscode ändern. Bei späterer Einführung solcher Hooks neu bewerten.

## Entwicklung und Workflow

Node **24.13.1** aus `.nvmrc`; die Release-Werkzeuge benötigen
`^22.14.0 || >=24.10.0`. Keine neue `engines.node`-Vorgabe, die Vercels Node-Auswahl
verändern könnte. Lokaler Ablauf:

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

`prepare: husky` installiert die Hooks. `pre-commit` führt Tests aus,
`commit-msg` prüft Conventional Commits. Husky-9-Hooks ohne alten Bootstrap,
LF-Zeilenenden über `.gitattributes`. In Actions bleibt `HUSKY=0`, damit der
Bot-Commit nicht erneut bereits bestandene Prüfungen ausführt.

| Nachricht | Wirkung nach `v1.1.0` |
| --- | --- |
| `fix: korrigiere die Watchlist` / `perf: beschleunige die Analyse` | Patch → `1.1.1` |
| `feat: ergänze einen Export` | Minor → `1.2.0` |
| `feat!: ändere das Datenformat` | Major → `2.0.0` |
| `docs: aktualisiere die Anleitung` / `ci: richte Releases ein` | kein Release |

Ein Footer `BREAKING CHANGE: Beschreibung` nach einer Leerzeile markiert ebenfalls
Major. Die höchste Wirkung seit dem letzten erreichbaren Versionstag zählt.
Bei PRs werden Titel und Base-SHA..Head-SHA geprüft, bei Pushes nur neue Commits.
Commitlint-Standardausnahmen für Merge/Revert gelten weiter. Bei Squash-Merges
die endgültige Commitnachricht konform halten; nachträgliche Änderungen im
Merge-Dialog wurden vom PR-Check nicht geprüft.

Der Workflow startet bei PRs gegen `main` und Branch-Pushes auf `main`, nicht
bei Tags oder GitHub-Releases. Zwei GitHub-hosted `ubuntu-latest`-Jobs:

- **Stockfolio verify:** vollständiger Checkout für Commit-Bereiche, `npm ci`,
  Commitlint, ESLint, `next typegen && tsc --noEmit`, Tests, Produktionsbuild.
  Typegen erzeugt Routentypen auch ohne vorhandenes `.next`.
- **Stockfolio release:** nur nach Verify bei Push auf `main`; vollständige
  Historie und Tags, Basisschutz, eigene Installation, Warten auf das genaue
  Production-Deployment, Prüfung der aktuellen Branchspitze, semantic-release.
  Keine erneuten Lint-/Typecheck-/Test-/Build-Läufe.

Nur Release erhält `contents: write`, `deployments: read` und `statuses: read`.
Der automatische `GITHUB_TOKEN` schreibt Branch-/Tag-/Release-Daten und liest
GitHub-Deployments, ihre Statushistorie und den Vercel-Commitstatus zur ID-Auflösung.
Issue-/PR-Kommentare, Labels und Fehler-Issues sind abgeschaltet; kein PAT,
keine Issue-/PR-Schreibrechte, keine Vercel-Secrets. Checkout behält im Release-Job
Credentials; semantic-release setzt selbst die Bot-Identität.

Effektive Rechte im ersten Lauf unter **Set up job → GITHUB_TOKEN Permissions**
prüfen. Pflicht-PRs, Signaturen oder Pflichtchecks können den direkten Bot-Push
blockieren: `contents: write` umgeht keinen Schutz. Bei späterem Branch-Schutz
einen begrenzten Bot-/App-Prozess planen, statt Schutz pauschal abzuschalten.
Tag-Regeln müssen neue `v*`-Tags erlauben.

Concurrency serialisiert Releases ohne Abbruch laufender Jobs. Direkt vor
`npm run release` liest `git ls-remote` die aktuelle Spitze von `main`. Sowohl
Remote-Spitze als auch lokales `HEAD` müssen exakt `$GITHUB_SHA` entsprechen;
sonst scheitert der veraltete Job vor jeder Veröffentlichung. Netzwerkfehler
brechen ebenfalls ab. Der neuere erfolgreiche Lauf verarbeitet die offenen Commits.

Das ist keine atomare Sperre gegen menschliche Pushes: Ändert sich `main` nach
dieser Prüfung, lehnt der normale Push des Git-Plugins einen nicht vorspulbaren
Release-Commit ab. Der installierte Plugin-Code verwendet keinen Force-Push.
Concurrency bleibt `cancel-in-progress: false`, damit ein laufender Job nicht
mitten zwischen irreversiblen Release-Schritten abgebrochen wird. Bei Fehlern
nach dem Bot-Push vor Wiederholung Branch, Tags und Releases prüfen: Git-Push
und GitHub-Release sind keine atomare Transaktion.

## Vercel-Schutz und Grenzen

Die produktive Projektkonfiguration wurde weder gelesen noch verändert. Die neue
versionierte `vercel.json` wirkt erst bei späterer Integration. Die bestehende
Git-Anbindung bleibt erhalten. `GITHUB_TOKEN` verhindert Folge-Actions-Workflows,
aber nicht Vercels Git-Trigger; auch `[skip ci]` gilt hier nicht als Vercel-Schutz.

`ignoreCommand: "node scripts/vercel-ignore-build.mjs"` benötigt vor Installation
nur Node-Bordmittel und Git, keine Vercel-Umgebungsvariablen. Vercels Konvention:
**Exit 0 überspringt, Exit 1 baut weiter**. Übersprungen wird nur, wenn:

- der Betreff exakt `chore(release): X.Y.Z [skip ci]` mit stabiler Version lautet;
- genau ein Parent existiert und ausschließlich die drei Release-Dateien
  gegenüber ihm geändert wurden;
- alle drei Versionsfelder zur Nachricht passen und Paket-/Lockfile-Objekte
  nach Entfernen nur dieser Felder vollständig unverändert sind.

Anwendungscode, Dependency-/Script-/Integritätsänderungen, andere Dateien,
Merge-Commits und inkonsistente Versionen werden nicht übersprungen.
Bei Git-/JSON-Fehlern oder fehlendem Parent wird weitergebaut. Dieser Fallback
schützt normale Deployments, lässt bei einem Erkennungsfehler aber einen
zusätzlichen Release-Build zu. Der übliche flache Clone mit zehn Commits genügt
für den direkten Parent.

Die eigene Polling-Schleife ist durch `vercel/wait-for-deployment-action` ersetzt,
fest gepinnt auf den geprüften Commit
`0e2b0c5c5cce31f1648108aeec56467187aca037` (21.05.2026, signierter/verifizierter
Upstream-Commit; Quellcode und ausführbares Bundle geprüft). Keine bewegliche
`main`-/Versionsreferenz. Die Action verwendet Node 24 und benötigt keinen Vercel-Token.

Explizite Eingaben: `environment: production`, `sha: ${{ github.sha }}`,
`status-context: Vercel`, erforderliche Deployment-ID, Timeout 600 Sekunden,
Intervall 15 Sekunden. Sie sucht über GitHubs Deployments API nach genau dieser
SHA und Umgebung **`Production`** und prüft den neuesten Status dieses Deployments.
Stockfolios vorhandenes Deployment `7103182634` für `780b031` hat genau diesen
Umgebungsnamen und `success`; die Integration ist damit geeignet. Ein allgemeiner
Commitstatus eines anderen Deployments ersetzt diese Prüfung nicht. Der
Commitstatus `Vercel` dient der Action nur zur Auflösung der zusätzlichen Vercel-ID.

Wichtig: Upstream behandelt auch `inactive` als bereit und kann dabei eine alte
weiterhin aktive URL ausgeben. Ein zusätzlicher Workflow-Schritt verlangt daher
ausdrücklich `deployment-state == success`. `inactive`, leere Outputs, Fehler,
fehlendes Deployment und Timeout blockieren den Release. Die Action sucht keine
beliebige andere erfolgreiche Umgebung oder SHA als Ersatz. Bei geänderten
Umgebungsnamen oder mehreren Projekten müssen Inputs entsprechend angepasst werden.

So erzeugt unser Metadatenpush keinen neueren Commit, während sein Quell-Deploy
noch wartet. Globale Queue-/Auto-Cancellation-Einstellungen bleiben unverändert.
Release-Verfügbarkeit hängt weiterhin zusätzlich von Vercel ab.
Siehe [geprüfte Action](https://github.com/vercel/wait-for-deployment-action/tree/0e2b0c5c5cce31f1648108aeec56467187aca037).

Verbleibende Grenzen:

- Der Ignore-Schritt verhindert den zweiten App-Build, nicht zwingend einen
  abgebrochenen Deployment-Eintrag. Solche Einträge können Deployment- und
  Concurrency-Limits beanspruchen.
- Repo-`ignoreCommand` überschreibt einen möglichen bestehenden Dashboard-
  Ignored-Build-Step. Diese Einstellung wurde nicht eingesehen: vor Aktivierung
  vorhandene Sonderregeln prüfen und gegebenenfalls bewusst zusammenführen.
- Ein manuell erzwungener Redeploy kann den Ignore-Schritt umgehen.
- Der erfolgreiche Quell-Deploy gehört zum Parent des Release-Tags. Das bereits
  gebaute Paket enthält dessen vorherige Version. Das Repo ist nach Release
  aktuell, die laufende App wird nicht neu gebaut. Für eine spätere im UI
  eingebettete Release-Version muss dieser Ablauf neu geplant werden.
- Der Bot-SHA kann einen abgebrochenen Vercel-Status erhalten. Der erfolgreiche
  Deploy liegt am Parent; der nächste normale Quellcommit wird wieder gebaut.
- Lokale Tests beweisen nicht Vercels tatsächliches Hosting-Verhalten. Beim
  ersten erlaubten Release müssen Skip-Eintrag und bestehender Quell-Deploy
  kontrolliert werden.

Alternativen: derselbe Filter im Dashboard wäre weniger gut versioniert;
`git.deploymentEnabled` filtert Branches und kann nicht einzelne Release-Commits
auf `main` ausschließen. Abschalten der Git-Anbindung oder Migration auf einen
Actions-Deploy-Job würde den gewünschten Ablauf ändern und wurde nicht umgesetzt.

Quellen: [ignoreCommand](https://vercel.com/docs/project-configuration/vercel-json#ignorecommand),
[Ignore-Step und Clone-Tiefe](https://vercel.com/kb/guide/how-do-i-use-the-ignored-build-step-field-on-vercel),
[Limits ignorierter Builds](https://vercel.com/docs/monorepos),
[Git-Konfiguration](https://vercel.com/docs/project-configuration/git-configuration).

## Build und spätere Freigabe

CI benötigt keine App-Secrets, Datenbank oder echten OAuth-/Provider-Aufrufe.
Fonts sind lokal, native Pakete werden plattformspezifisch mit npm installiert.
Zur Laufzeit gelten die Variablen aus `.env.sample`, besonders `MONGO_URL`,
`DATABASE`, `ALPHA_VANTAGE_KEY`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` und OAuth-Keys.
Der Build ersetzt keine Integrationstests dieser Dienste.

Vercel startet Quell-Deployments weiterhin parallel zur CI. Der Warte-Schritt
lässt CI auf Vercel warten; er lässt Vercel nicht auf CI warten. Für eine spätere
Freigabe `Stockfolio verify` als erforderlichen PR-Check und in Vercels Deployment
Checks für denselben Produktions-SHA einrichten. Nicht `Stockfolio release`
verwenden: Dieser Job wartet selbst auf Vercel, sonst droht gegenseitiges Warten.
Keine entsprechende Dashboard-Änderung vorgenommen.
[Vercel Deployment Checks](https://vercel.com/docs/deployment-checks).

## Erstmalige Aktivierung – nur Anleitung

Keine Commits, Pushes, Tags, Releases oder Deployments wurden ausgeführt.
Basis bleibt `1.1.0`. Ohne erreichbares `v1.1.0` blockiert der Release-Job;
andernfalls würde semantic-release die alte Historie als ersten Release `1.0.0`
auswerten. Das initiale Changelog ist eine Beschreibung, noch kein veröffentlichter Release.

1. Tags/Releases, Branch-/Tag-Regeln und Tokenrechte erneut prüfen. In Vercel
   Repo-Root und einen eventuell bestehenden Ignored-Build-Step kontrollieren.
   Keine neue Vercel-Authentifizierung oder Änderung der Git-Anbindung nötig.
2. Alle Dateien gemeinsam per PR mit konformen Commits/Titel integrieren.
   Der Push kann normal deployen. Verify und Quell-Deploy kontrollieren;
   Release scheitert zunächst absichtlich am fehlenden Ausgangstag. Bis zur
   Initialisierung keine weiteren Änderungen integrieren.
3. Einen sauberen Checkout exakt mit dem integrierten `origin/main` synchronisieren:

   ```sh
   git switch main
   git pull --ff-only origin main
   git fetch origin --tags
   git status --short
   git log -5 --oneline --decorate
   git tag --list
   git ls-remote --tags origin
   gh release list
   npm ci
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

4. Wenn Verify und Quell-Deploy erfolgreich sind, `HEAD` exakt `origin/main`
   entspricht, alle drei Versionsfelder `1.1.0` sind und noch kein entsprechendes
   oder neueres Tag existiert, den geprüften Ausgangsstand markieren:

   ```sh
   git tag v1.1.0 HEAD
   git push origin v1.1.0
   ```

   Bestehende Tags niemals überschreiben. Die Basis braucht keinen GitHub-Release.
   Der Tag-Push startet diesen Actions-Workflow nicht.
5. Im ursprünglichen Lauf nur die fehlgeschlagenen Jobs erneut starten, sofern
   dessen SHA noch die Basis ist. Der Checkout lädt das Tag; ohne neue relevante
   Commits endet Release erfolgreich ohne Bot-Commit oder Veröffentlichung.
6. Beim nächsten relevanten Merge: Verify → Production-success für den Quell-SHA
   → Prüfung auf aktuelle `main`-Spitze → Metadatencommit → Tag/GitHub-Release.
   Versionsfelder, Changelog, Parent-Zuordnung und den
   verhinderten zweiten Vercel-App-Build im ersten echten Ablauf kontrollieren.

## Dry-Run

Auf aktuellem `main` mit vollständiger Historie, temporärem `GH_TOKEN` oder
`GITHUB_TOKEN` und funktionsfähigem Git-Zugang: `npm run release:dry-run`.
Keine Zugangsdaten in Dateien oder Remote-URLs speichern. Lokal benötigt der
Token Contents read/write; für die Deployment-Action zusätzlich Deployments read
und Commit statuses read. Im Workflow genügt der eingebaute Token.

Dry-Run verifiziert Plugins, GitHub-Zugang, Push-Dry-Run, Analyse und Notizen.
Er überspringt `prepare`, Commits, Tags, `publish`, `success`, `fail`. Deshalb
wurde die tatsächliche Dateiaktualisierung separat mit npm-/Changelog-`prepare`
in einem Fixture ohne Git-Repo geprüft. Git-`prepare` wurde nicht ausgeführt.
Auf einem Featurebranch würde ein normaler Dry-Run die Release-Auswahl nur überspringen.

Ergebnisse: [ci-release-validation.md](ci-release-validation.md).
Weitere Quellen: [npm-Plugin](https://github.com/semantic-release/npm),
[Git-Plugin](https://github.com/semantic-release/git),
[GitHub-Token](https://docs.github.com/en/actions/concepts/security/github_token).
