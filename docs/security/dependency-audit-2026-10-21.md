# Dependency-Audit und Security-Hardening

Stand: 21.10.2026. Ausgangspunkt: `main` auf `51a83f5` nach PR #7.
Arbeitsbranch: `fix/dependency-security-hardening`. Lokal: Windows x64,
Node 24.13.1, npm 11.8.0. Dieser Bericht beschreibt Repository und Lockfile,
keine bereits erfolgte Auslieferung auf Vercel.

## Ergebnis und Belege

| Audit | Vorher | Nachher |
| --- | --- | --- |
| `npm audit` einschließlich Entwicklung | 33 Paketmeldungen: 1 kritisch, 30 hoch, 2 moderat | 14 hohe Paketmeldungen, alle aus einem ungepatchten `braces`-Advisory |
| `npm audit --omit=dev` | 3 Paketmeldungen: Next kritisch, sharp und source-map-js hoch | **0 Meldungen** |
| Unterschiedliche zugrunde liegende Advisories im Gesamtaudit | 14 | 1 |

Die Paketanzahl ist nicht die Zahl unabhängiger Lücken: npm zählt auch
abhängige Werkzeuge als betroffen. Der verbleibende Befund betrifft nicht 14
verschiedene Sicherheitslücken. Ein Audit ohne Meldung ist umgekehrt kein
vollständiger Sicherheitsnachweis für Anwendungscode, gebündelte Fremdsoftware
oder unbekannte Advisories.

Nachvollziehbare JSON-Belege:

- [Gesamtaudit vorher](dependency-audit-2026-10-21/before-all.json)
- [Produktionsaudit vorher](dependency-audit-2026-10-21/before-production.json)
- [Gesamtaudit nachher](../../npm-audit.json)
- [Produktionsaudit nachher](dependency-audit-2026-10-21/after-production.json)
- [Veraltete direkte Pakete vor dem Update](dependency-audit-2026-10-21/outdated-before.json)

Die Ausgangsdatei `npm-audit.json` enthielt einen älteren Nullbefund. Sie wurde
durch den aktuellen Gesamtaudit einschließlich des verbleibenden Dev-Risikos
ersetzt. Audit-Befehle verwenden JSON, `--fetch-retries=0` und
`--fetch-timeout=15000`; kein `npm audit fix`, kein `--force`, kein Ignorieren von Peers.

## Produktionspfade und Priorisierung

| Paket / Advisory | Relevanz in Stockfolio | Korrektur |
| --- | --- | --- |
| Next / [GHSA-cjq9-62q9-8jv4](https://github.com/advisories/GHSA-cjq9-62q9-8jv4), hoch: Image-Optimization-SSRF | Priorität: `/_next/image` ist vom Auth-Proxy ausgenommen und `next/image` nutzt den erlaubten Host `flagcdn.com`. Ein zugelassener, angreiferkontrollierter Host bzw. DNS ist Voraussetzung; eine solche Kontrolle wurde nicht nachgewiesen. | Next 16.3.8; zusätzlich nur querylose `/w40/*.png` zulassen. Die engere Allowlist ersetzt den Framework-Patch nicht. |
| Next / [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), kritisch: Node-`next/og`-RCE | Keine `ImageResponse`-/`next/og`-Nutzung oder dynamischen OG-Bildrouten gefunden. Keine bestätigte Anwendungs-RCE; dennoch betroffene Framework-Version entfernen. | Next 16.3.8 enthält den Fix ab 16.3.6. |
| sharp / [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w), hoch: librsvg-Speicherfehler | Next verwendet sharp. Keine direkte SVG-Dekodierung gefunden; `dangerouslyAllowSVG` bleibt standardmäßig aus. Mögliche RCE hängt zusätzlich von Linux/glibc/Node-Härtung ab; Windows beweist diese Produktionsbedingungen nicht. | sharp 0.35.5 mit aktualisiertem vorgebautem librsvg; direkte und Next-Override-Version angeglichen. |
| source-map-js / [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), hoch: Event-Loop-DoS | Über `next → postcss` eine Produktionsabhängigkeit. Kein Endpunkt gefunden, der fremde Source Maps in diesen Parser einspeist; Build-/Fehlerverarbeitung bleibt ein Grund zum Patchen. | PostCSS 8.5.31 verlangt source-map-js `^1.2.2`; Lockfile löst die behobene Version auf. |

Next 16.3.8 behebt außerdem die gemeldeten Cache-/Metadatenfälle:
[Draft Mode/use cache](https://github.com/advisories/GHSA-3w37-wq28-93x7),
[Self-hosted Pages-SSG/ISR](https://github.com/advisories/GHSA-4jqv-mc3x-m676),
[Root-Catch-all-Cache](https://github.com/advisories/GHSA-mcj8-r9mp-w47p) und
[dynamische Metadatenbilder](https://github.com/advisories/GHSA-f87g-xv8r-7p7x).
Die jeweiligen Voraussetzungen sind hier nicht gefunden: App Router auf Vercel,
kein `use cache`/Draft Mode, keine Root-Catch-all-Seite oder dynamischen OG-Routen.
Die verschachtelte NextAuth-Catch-all-API ist keine Root-Catch-all-Seite.
Das weitere [MCP-Origin-Advisory](https://github.com/advisories/GHSA-39w2-rjm5-chcv)
betrifft `next dev`, nicht den Produktionsserver. Alle sieben zuvor gemeldeten
Next-Advisories werden durch das Patchupdate aus dem Audit entfernt.

Dies führt die frühere Triage [SF-01](SF-01.md) als gezielten Folgepatch aus;
die historischen Befunde in SF-01 bleiben als damalige Momentaufnahme erhalten.

## Updates und Versionsentscheidungen

| Paket / Override | Installierter Ausgangsstand | Ziel | Entscheidung |
| --- | --- | --- | --- |
| next / eslint-config-next | 16.3.3 | 16.3.8 | Kleinster gemeinsamer Security-Patch im selben 16.3-Zweig; kein Sprung auf die verfügbare 16.4.2 nötig. |
| sharp | 0.35.4 | 0.35.5 | Direkte Dependency und Next-Override konsistent. |
| react / react-dom | 19.0.0 | 19.0.9 | Beide synchron auf aktuellen 19.0-Patch, ohne Minor-/Major-Migration. Nexts Peer-Range `^19.0.0` passt. |
| postcss | 8.5.23 | 8.5.31 | Root-Dev-Dependency sowie globaler und Next-spezifischer Override angeglichen. |
| source-map-js, transitiv | 1.2.1 | mindestens 1.2.2 | Über die neue PostCSS-Abhängigkeit, keine zusätzliche direkte Dependency nötig. |
| brace-expansion, bestehender Override | 5.0.9 | 5.0.12 | Schließt drei neue ReDoS-/Rekursionsadvisories im bereits verwendeten Major. |
| postcss-selector-parser, neuer Override | 6.1.4 im Tailwind-/postcss-nested-Pfad | 7.1.6 | Gesondert geprüfter Major-Override ausschließlich für den Parser; kein Tailwind-4-Umbau. |

Offizielle [Next-Release-Notes](https://github.com/vercel/next.js/releases/tag/v16.3.8)
und [React-19.0.9-Notes](https://github.com/react/react/releases/tag/v19.0.9) wurden
gelesen. Keine öffentliche App-API wird in diesem PR absichtlich verändert.
Die App-Paketversion `1.1.0` bleibt der Release-Automatisierung vorbehalten.

Die drei brace-expansion-Advisories sind
[GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr),
[GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) und
[GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p).
Sie betreffen lokale Musterverarbeitung über ESLint/minimatch; kein direkter
HTTP-Eingabepfad wurde gefunden.

### Gesonderte Prüfung des Parser-Major-Overrides

Das [Selector-Parser-Advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf)
ist erst ab 7.1.6 behoben, nicht in der verfügbaren 6er-Serie.
Der [Upstream-Changelog](https://github.com/postcss/postcss-selector-parser/blob/master/CHANGELOG.md)
nennt für 7.0 insbesondere sichere Einfügungen während AST-Iteration; diese
geänderte Iterationssemantik ist das zu berücksichtigende Kompatibilitätsrisiko.
Die aufrufenden Tailwind-/postcss-nested-Versionen fordern ursprünglich Major 6,
deshalb ist dies ausdrücklich ein Override außerhalb ihrer deklarierten Range.

Der bestehende Projekt-CSS-Stand wird vor und nach dem Update mit derselben
Tailwind-Konfiguration kompiliert und verglichen. Zusätzlich müssen kompletter
Build, Lint und Tests bestehen. Das belegt die verwendeten Projektpfade, keine
universelle Kompatibilität aller möglichen AST-Manipulationen. Pin 7.1.6 wählt
gezielt den Security-Fix statt zusätzlicher späterer Parseränderungen.

### Zurückgestellte größere oder sachfremde Updates

- Next bleibt auf Major 16. React bleibt auf 19.0; das verfügbare 19.3.1 ist
  keine notwendige Voraussetzung für die hier behobenen Advisories.
- NextAuth 4.24.15, MongoDB 6.21.0 und Mongoose 8.24.1 bleiben unverändert:
  kein aktueller Audit-Befund dort. Ein Mongoose-8.24.6-Patch ist verfügbar,
  wird ohne Sicherheitsgrund nicht mit einer ungetesteten DB-Verhaltensänderung vermischt.
- [Auth.js v5](https://authjs.dev/getting-started/migrating-to-v5) würde unter
  anderem `getServerSession`/Konfiguration und Cookie-/Session-Verhalten ändern;
  das ist eine eigene Auth-Migration mit OAuth-/Credentials-Tests.
- [MongoDB 7](https://www.mongodb.com/docs/drivers/node/current/reference/upgrade/)
  aktualisiert BSON und weitere Treiberkomponenten und enthält Auth-Änderungen.
  [Mongoose 9](https://mongoosejs.com/docs/migrating_to_9.html) bringt eigene
  Breaking Changes. Serverkompatibilität und echte Datenbanktests fehlen hier.
- JSDOM 29, Lucide 1, Tailwind 4, ESLint 10, TypeScript 7 und neue Typdefinitionen
  sind gesonderte Migrationen. Ein blindes `npm update`/`audit fix --force` würde
  unnötige Änderungen oder sogar alte Release-Plugin-Versionen einführen.

## Verbleibendes Entwicklungsrisiko

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm):
`braces <=3.0.3` kann bei tief verschachtelten Mustern den Stack erschöpfen.
Registry und Advisory bestätigen am Prüftag: **keine veröffentlichte Fixversion**;
3.0.3 ist weiterhin latest. Betroffen sind über micromatch/chokidar/fast-glob
unter anderem Tailwind, Next-ESLint und semantic-release samt Plugins.
Die 14 verbleibenden npm-Paketmeldungen stammen sämtlich von diesem einen Befund.

Das ist ein echtes Entwicklungs-/Build-/Release-Risiko, auch während eines
Vercel-Builds mit installierten Dev-Dependencies. Es ist kein gefundener
Stockfolio-HTTP-Laufzeitpfad: Produktionsaudit und Projektverwendung trennen
diesen Fall. Aktuelle Content-/Release-Globs sind feste Repository-Konfiguration,
keine fremden Anfrageparameter. Vertrauenswürdige Konfiguration und Review von
Änderungen an Globs/Buildskripten bleiben nötig; CI-Timeouts begrenzen einen Job,
beheben die Bibliothekslücke aber nicht.

Keine fremde Fork-/Git-Dependency, kein selbst gebauter Parser-Patch und kein
von npm vorgeschlagenes Major-Downgrade alter semantic-release-Plugins.
Bei Veröffentlichung einer behobenen braces-Version bzw. einer upstream
bereinigten Toolchain gezielt neu auditieren und aktualisieren.

## Erhalt bestehender Schutzmaßnahmen und Validierung

SF-02 bleibt unverändert: Fundamentals nur über den authentifizierten
Serverendpunkt, fester Providerhost, erlaubte Operationen/Symbole, privater
`ALPHA_VANTAGE_KEY`, keine öffentlichen Schlüssel oder Provider-URL-Fehlerlogs.
Die bestehenden Fundamentals-Regressionen müssen weiter bestehen.
SF-07 bleibt unverändert: kein `ignoreBuildErrors`; eigenständiger Typecheck
und Next.js-Build prüfen TypeScript weiterhin.

Release-Workflow, `.releaserc.json`, Husky und `vercel.json` werden nicht geändert.
Der spätere PR-Verify prüft den Branch, der Release-Job läuft nur auf `main`.
Ein PR kann gemäß vorhandener Vercel-Integration ein Preview auslösen; es wurde
kein Produktionsdeploy, Merge, Tag oder Release angefordert oder durchgeführt.

| Prüfung | Ergebnis |
| --- | --- |
| `npm ci` | Vollständige Neuinstallation: 804 Pakete, Exit 0. SHA256 des Lockfiles vor/nach identisch. |
| `npm ls` der aktualisierten Pakete | Exit 0, keine ungültigen Peers. Alle React-/React-DOM-Konsumenten auf 19.0.9 dedupliziert; Next und ESLint-Config auf 16.3.8. |
| ESLint | Exit 0. Nur bestehende Warnung in `components/auth/LoginForm.tsx:46`; kein neuer Befund. |
| Typecheck | `next typegen && tsc --noEmit`: Exit 0. |
| Tests | 12 bestanden: drei Fundamentals-, zwei Image-Allowlist- und sieben Vercel-Ignore-Tests. |
| Produktionsbuild | Next 16.3.8 / Turbopack, einschließlich TypeScript und 19/19 statischen Seiten: Exit 0. `.env`-Dateien und App-Zugangsdaten waren ausgeblendet und wurden wiederhergestellt. |
| Parser-Kompatibilität | Minifiziertes Tailwind-CSS vor/nach byteidentisch: SHA256 `a1de1bf1cc4c54395783a83b9ccfd53375a21f96fcf5c6be7961d313eb761fd2`. |
| Native Bibliotheken lokal | sharp 0.35.5, libvips 8.18.7, librsvg 2.63.2. Lockfile enthält auch Linux-SWC 16.3.8, sharp 0.35.5 und libvips-Bundle 1.3.4. |
| Lokale Laufzeit-Smokes | Login und Session-Endpunkt 200; anonyme Fundamentals-/Account-Anfragen 401; nicht erlaubter Image-Pfad 400. Nur Loopback, synthetisches lokales Session-Secret, kein DB-/OAuth-/Alpha-Vantage-Zugriff. Server anschließend beendet. |
| Erhalt bestehender Konfiguration | Diffprüfung: Release-Workflow, `.releaserc.json`, `vercel.json`, Ignore-Filter, Husky, Fundamentals-Route, Server-Key-Modul und Auth-Proxy unverändert. Paket-Skripte und Auth-/DB-Deklarationen unverändert; alle App-Versionsfelder weiter 1.1.0. |

Der Linux-Runner wird über die unveränderte PR-CI geprüft. Ein lokaler
Windows-Build ersetzt weder diese Plattformprüfung noch den Abgleich eines
später tatsächlich ausgelieferten Vercel-Artefakts. Echte OAuth-Anmeldungen,
Datenbankoperationen, Flag-CDN-Verfügbarkeit und Providerantworten wurden nicht
mit Produktivkonten getestet. Es wurden keine Secrets rotiert, keine Altdownloads
entfernt und keine bereits produktiv ausgelieferte Version verändert.
