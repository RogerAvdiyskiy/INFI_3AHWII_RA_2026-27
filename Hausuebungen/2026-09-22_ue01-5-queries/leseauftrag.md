# Leseauftrag: Drizzle vs. Prisma 2026

**Quelle:** HK Lee, "Drizzle ORM vs Prisma in 2026: The Honest Comparison Nobody Is Making", DEV Community, 18.02.2026.  
<https://dev.to/pockit_tools/drizzle-orm-vs-prisma-in-2026-the-honest-comparison-nobody-is-making-3n6g>

---

## Abschnitt 1: The Philosophical Divide

> Prisma denkt fuer dich (Modelle + Relationen beschreiben, SQL verstecken),  
> Drizzle denkt mit dir (typisiertes SQL schreiben, DB zeigen).

### Frage 1: Erklaere in einem Satz, was "abstraction-first" vs. "SQL-first" fuer deinen Alltag bedeutet: Wo siehst du SQL noch, wo nicht mehr?
Bei "abstraction-first" (Prisma) arbeitet man mit abstrakten Objekt-Modellen und Relationen im Code, sodass das darunterliegende SQL vollstaendig verborgen bleibt; bei "SQL-first" (Drizzle) schreibt man direkt typisierte SQL-Ausdruecke in TypeScript, wodurch Tabellen, JOINs und Where-Klauseln explizit und transparent sichtbar bleiben.

---

## Abschnitt 2: Schema Definition - Two Worlds

> Prisma-Schema (eigene DSL, eigene Datei) vs. Drizzle-Schema (reines TypeScript, volle IDE-Unterstuetzung).

### Frage 2: Nenne je einen Vorteil: Wann ist eine eigene Schema-Sprache bequemer, wann ist "alles TypeScript" bequemer?
Eine eigene Schema-DSL (Prisma) ist bequemer, wenn man eine kompakte, deklarative und sprachunabhaengige Modellierung wuenscht; "alles TypeScript" (Drizzle) ist bequemer, wenn man Schema-Definitionen modular zusammensetzen, bestehende TypeScript-Typen oder Konstanten direkt wiederverwenden und Autovervollstaendigung ohne separaten Codegenerator nutzen will.

### Frage 3: Was passiert bei Prisma, wenn du das Schema aenderst, aber `prisma generate` vergisst? Warum kann das bei Drizzle nicht passieren?
Bei Prisma generiert der Prisma-Client die TypeScript-Typen aus der `.prisma`-Datei; vergisst man `prisma generate`, arbeiten TypeScript und Anwendungscode noch mit dem veralteten Typstand, was zu Laufzeitfehlern fuehren kann. Bei Drizzle kann dies nicht passieren, da das Schema selbst bereits reiner TypeScript-Code ist und der Compiler Schema-Aenderungen sofort in Echtzeit widerspiegelt.

---

## Abschnitt 3 (Kern): Real-World Decision Framework + Performance-Kapitel

### Frage 4: Warum sind Benchmarks von vor 2026 laut Artikel "wegzuwerfen"? Was hat sich technisch geaendert?
Benchmarks vor 2026 bezogen sich auf die alte, schwere Rust-Binary-Engine von Prisma (~14 MB), die hohe Latenzen und traegere Cold Starts verursachte. Mit Prisma 7 wurde die Rust-Engine durch eine kompakte TypeScript/WASM-Architektur ersetzt (~1,6 MB), wodurch Cold Starts bis zu 9-mal schneller und Abfragen grosser Resultate bis zu 3,4-mal schneller wurden.

### Frage 5: Der Artikel empfiehlt Prisma fuer SQL-ferne Teams und Drizzle fuer SQL-starke Teams mit Edge-/Size-Zielen. Zu welcher Gruppe gehoert unsere Klasse nach dem heutigen Rep-Stand - und was folgt daraus?
Durch die intensive Vorarbeit mit reinen SQL-Queries, Joins, Aggregationen und Normalformen (1NF bis 3NF) baut unsere Klasse ein fundiertes SQL-Verstaendnis auf und zaehlt daher zu den SQL-starken Teams. Daraus folgt, dass Drizzle didaktisch und technisch das passendere ORM fuer uns ist, da es unser SQL-Wissen direkt typisiert weiterfuehrt, statt es hinter einer Abstraktionsschicht zu verstecken.

---

## Transferfrage (HUE, schriftlich, 5-6 Saetze)

### Frage 6: Setze den Artikel zu unserer Lage in Beziehung: Deno mit eingebautem `node:sqlite`, Prisma-7-Adapter-Pflicht (`better-sqlite3` nativ) und npm-`latest`, das auf einen 8.0.0-RC zeigt. Begruende, warum wir im Unterricht zuerst reines SQL fahren und ein ORM erst spaeter - und wenn, eher Drizzle - evaluieren.

Unsere Entwicklungsumgebung basiert auf Deno mit nativem `node:sqlite`, was eine schlanke, plattformuebergreifende SQLite-Einbindung ohne externe C++-Build-Ketten garantiert. Prisma 7 erfordert hingegen unter Node/Deno fuer SQLite zwingend Adapter-Pakete wie `@prisma/adapter-better-sqlite3`, was die Toolchain unnoetig aufblaeht und durch npm-latest-Verweise auf 8.0.0-Release-Candidates instabil macht. Didaktisch muss zunaechst reines SQL im Vordergrund stehen, damit das relationale Datenmodell, Indizes, Joins und Gruppierungen mental gefestigt werden, bevor Bibliotheken diese Grundlagen verdecken. Wenn spaeter ein ORM evaluiert wird, spricht die minimale Runtime von rund 12 KB und die direkte `node:sqlite`-Kompatibilitaet klar fuer Drizzle. Drizzle unterstuetzt unser SQL-Verstaendnis durch transparente TypeScript-Query-Builder, waehrend Prisma zusaetzliche Komplexitaet durch DSL und Codegenerierung einfuehrt.
