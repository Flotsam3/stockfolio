# Validierung der synchronisierten Release-Konfiguration

20.10.2026, Windows, Node 24.13.1, npm 11.8.0. Quellstand `64deb45`, dateigleich
mit Remote-`main` `780b031`, zuzüglich uncommitteter CI-/Release-Dateien.

## Änderungen gegenüber der ersten Variante

- `@semantic-release/npm` 13.2.0 mit `npmPublish: false` und
  `@semantic-release/git` 10.0.1 als direkte Entwicklungsabhängigkeiten.
- Root-`CHANGELOG.md` mit expliziter Ausgangsbasis statt Einzelanhängen.
- Bot-Commit nur für Changelog und beide Paketdateien; Versionstag am Bot-Commit.
- Repo-`vercel.json` mit gezieltem Ignored Build Step, sieben Regressionstests.
- Eigene Status-Polling-Schleife ersetzt durch die offizielle Action am festen SHA
  `0e2b0c5c5cce31f1648108aeec56467187aca037`. Explizit Production und Quell-SHA;
  zusätzlicher Erfolgsfilter lehnt Upstreams ebenfalls akzeptiertes `inactive` ab.
- `deployments: read` und `statuses: read` neben `contents: write`; kein neues
  Secret oder Deploy-Job. Direkt vor semantic-release müssen Remote-`main` und
  lokales HEAD mit dem geprüften Quell-SHA übereinstimmen.
- Aktivierungsanleitung, Versionsvergleich, Token-/Branch-Regeln und Vercel-
  Einschränkungen in [releases.md](releases.md) neu beschrieben.

## Erneut ausgeführte Prüfungen

| Prüfung | Ergebnis |
| --- | --- |
| Remote-Bestand | `main` unverändert auf `780b031`; keine Remote-Tags oder GitHub-Releases. Kein klassischer Branch-Schutz, keine wirksamen Branch-Regeln. Actions-Standardrechte read. |
| `npm ci` | Exit 0, vollständige Installation von 804 Paketen. Aufruf mit `--no-audit --no-fund --fetch-retries=0 --fetch-timeout=15000`; keine `--force`-/`--legacy-peer-deps`-/`--ignore-scripts`-Ausnahme. Lockfile-SHA256 vor/nach identisch. |
| Abhängigkeitsgraph | `npm ls @semantic-release/npm @semantic-release/git conventional-commits-filter --all`: Exit 0, korrekte Pluginversionen und keine ungültigen Peers. Kein bestehendes Produktionspaket entfernt oder in seiner Version geändert. |
| ESLint | Exit 0, keine Fehler. Eine bestehende Warnung in `components/auth/LoginForm.tsx:46` wegen Navigation über `window.location.href`; keine neue Warnung. |
| Typecheck | `next typegen && tsc --noEmit`: Exit 0. Der saubere Checkout ohne `.next` wurde bei der ersten Einrichtung zusätzlich erfolgreich geprüft; dieser Mechanismus bleibt erhalten. |
| Tests | `npm test`: 10 bestanden, 0 fehlgeschlagen. Drei vorhandene Fundamentals-Tests plus sieben Vercel-Tests. |
| Produktionsbuild | `npm run build` mit Turbopack: Exit 0, Typprüfung bestanden, 19/19 statische Seiten erzeugt. Next.js-`.env`-Dateien vorübergehend ausgeblendet, App-Zugangsdaten und URL-Variablen aus Prozessumgebung entfernt; anschließend wiederhergestellt. Kein Deployment. |
| actionlint | Offizielles, zuvor per SHA256 geprüftes actionlint 1.7.12: `-shellcheck='' .github/workflows/release.yml`, Exit 0, keine Befunde. Shellcheck nicht ausgeführt. |
| Commit-Regeln | Acht gültige Beispielnachrichten akzeptiert, drei ungültige abgelehnt. Tatsächlicher Analyzer: `fix`/`perf` Patch, `feat` Minor, `!`/Breaking-Footer Major; `docs`/`ci`/`chore` kein Release; höchste Wirkung gewinnt. |
| Echte lokale Dateisynchronisierung | npm-`verifyConditions` und `prepare` sowie Changelog-`prepare` mit aktueller Konfiguration auf Kopien der wirklichen Paket-/Lock-/Changelog-Dateien, ohne Git-Repo und ohne npm-Token. Alle drei Versionsfelder danach `1.2.0`; neuer Eintrag vor bestehendem Changelog; Vercel-Skip-Filter akzeptiert exakt diese realen Änderungen. Root-Dateien bleiben `1.1.0`. Git-`prepare` und Publish nicht aufgerufen. |
| Vercel-Filter | Akzeptiert reine Metadaten-Fixture; baut bei normalem Commit, Code-/Konfigurationsänderungen, Dependency-/Script-/Lockintegritätsänderungen, Versionsabweichungen, Merge/root, fehlenden Git-Daten und ungültigem JSON weiter. CLI am tatsächlichen normalen HEAD gibt erwartungsgemäß 1 (weiterbauen) zurück. Keine Testcommits angelegt. |
| Action-Prüfung und Pin | Upstream-Commit vom 21.05.2026 ist laut GitHub verifiziert. `action.yml`, Quellcode und ausgeführtes `dist/index.js` am festen SHA gelesen; lokale Downloads stimmen mit den GitHub-Blob-Hashes überein. Node-24-Runtime und alle verwendeten Inputs/Outputs geprüft. |
| Echte Deployment-Zuordnung | Gepinntes Action-Bundle ausschließlich mit GET-Anfragen am vorhandenen Quell-SHA `780b031` ausgeführt: GitHub-Deployment `7103182634`, Umgebung `Production`, Zustand `success`, Vercel-ID `dpl_EXg2RdZByANbKrPX8aVmqTXeCpJJ`. Kein Deployment erzeugt oder verändert. Das allgemeine Feld `production_environment` ist dort false; die Vercel-Integration verwendet den bestätigten Umgebungsnamen `Production`, nach dem die Action filtert. |
| Action-/Erfolgsfilter-Fixtures | Tatsächliches gepinntes Bundle mit simulierten GitHub-GET-Antworten: Production-success für exakte SHA akzeptiert; failure, error, fehlendes Deployment, nur Preview, andere SHA, pending/Timeout, fehlende Vercel-ID abgewiesen. Upstream akzeptiert inactive, aber der echte zusätzliche YAML-Shellschritt lehnt es ab. Auch leere/fehlerhafte/nicht erfolgreiche Outputs blockieren. Keine reale Wartezeit oder Fixture-Commits nötig. |
| Konkurrenzschutz | Shellcode direkt aus YAML getestet, npm durch Fixture-Stub ersetzt: aktuelle verifizierte Remote-/HEAD-SHA akzeptiert; neuere Remote-SHA, falsches HEAD, unerreichbares Remote und fehlendes main blockieren vor dem npm-Aufruf. Installierter Git-Plugin-Code bestätigt normalen Push ohne Force-Option. |
| semantic-release Dry-Run | 25.0.9 auf echtem Remote-`main` im isolierten temporären Checkout mit aktueller Konfiguration und Paketdateien: Exit 0. Changelog-, npm-, Git- und GitHub-`verifyConditions` bestanden; Push-Dry-Run, Analyse und Notizen erfolgreich. Ohne Tag erwartungsgemäß erster Release `1.0.0` aus 106 Commits; alle Prepare-/Publish-/Tag-/Success-Schritte übersprungen. |

Der in der ersten Einrichtung aufgedeckte Peer-/Lockfile-Konflikt wurde damals
mit `npm install --package-lock-only` korrigiert; die erneute komplette Installation
mit den zwei weiteren Plugins besteht weiterhin. Kein manueller Lockfile-Patch.

Die installierten Husky-Hooks und der fehlende-Ausgangstag-Schutz wurden bereits
in der ersten Einrichtung ohne Commit getestet: gültige Commitnachricht akzeptiert,
ungültige abgewiesen, fehlendes `v1.1.0` blockiert. Die Release-Nachricht ist
`chore(release): X.Y.Z [skip ci]`; sie wurde separat mit Commitlint und dem
Analyzer erneut erfolgreich geprüft und ist nicht releasewirksam.

## Grenzen und Bereitschaft

Die Konfiguration ist lokal fertig und für die dokumentierte Aktivierung
vorbereitet. **Automatische Releases bleiben absichtlich blockiert**, bis alle
Dateien integriert und das geprüfte Ausgangstag `v1.1.0` manuell initialisiert
wurden. Das Changelog allein initialisiert keine Release-Historie.

Vor dem ersten Release noch zu bestätigen:

1. Vercels Projekt-Root und ein eventuell schon vorhandener Dashboard-Ignored-
   Build-Step: die neue Repo-Konfiguration überschreibt diesen Schritt. Es wurde
   kein Zugriff auf das produktive Vercel-Projekt vorgenommen.
2. Ein echter Linux-Actions-Lauf und die effektiven Rechte seines automatischen
   `GITHUB_TOKEN`, insbesondere Deployments-/Statuses-Leserechte, direkter Bot-Push
   auf `main` und neue Versionstags.
   Der lokale Dry-Run nutzte temporär vorhandene lokale GitHub-Authentifizierung.
3. Beim ersten erlaubten echten Release: erfolgreicher Quell-Deploy, anschließend
   Metadatencommit mit korrekten Versionen/Changelog, Tag/Release und übersprungener
   zweiter Vercel-App-Build. Das wurde wegen des Deploymentverbots nicht live getestet.

Der Ignore-Schritt kann einen abgebrochenen Deployment-Eintrag samt Quoten-/
Concurrency-Verbrauch hinterlassen. Bei fehlender History oder bewusstem
manuellem Bypass kann trotzdem ein zweiter Build entstehen. Produktion bleibt
auf dem vorherigen geprüften Quell-SHA und enthält dessen alte Paketversion;
der Release-Tag zeigt auf den Metadaten-Nachfolger. Umbenannte Production-
Umgebungen oder fehlende passende Deployment-/ID-Daten blockieren spätestens
nach Timeout bzw. bei der ID-Auflösung die Veröffentlichung. Nur success des
konkreten Production-Deployments genügt; inactive oder ein fremder grüner
Commitstatus reichen nicht. Die SHA-Prüfung ist keine atomare Branch-Sperre;
weitere Fortschritte nach ihr werden durch Git ohne Force-Push abgefangen,
sofern sie mit dem Release-Commit divergieren. Push/Tag/GitHub-Release bleiben
mehrere Schritte mit möglichen Teilfehlern.

Es wurden keine Commits, Pushes, Merges, neuen Git-Tags, GitHub-Releases oder
Deployments ausgeführt. Lokale Fixtures liegen ignoriert unter `.release/validation/`,
der Dry-Run-Checkout im Temp-Verzeichnis. Der Text `v1.2.0` aus `npm version` im
Fixture ist eine Konsolenausgabe; `--no-git-tag-version` und das fehlende Git-Repo
verhindern eine Tag-/Commit-Erstellung.
