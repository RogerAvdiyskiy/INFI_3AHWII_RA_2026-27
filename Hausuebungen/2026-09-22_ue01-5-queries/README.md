# HUE vom 22.09.2026 (UE 1) - 5 Auffrischungs-Queries

**Klasse:** 3AHWII (X-Gruppe) * **Fach:** INFI (KM5, WS 2026/27)  
**Stellung:** `GRG-INFI/3ahwii/lessons/0001-wiederholung-diagnose.html` §4 ("genau diese 5 Auffrischungs-Queries"), Semesterplan UE 1.  
**Abgabeformat:** `.sql`-Datei mit je einem Kommentar (siehe `queries.sql`) sowie Ausarbeitung des Leseauftrags (siehe `leseauftrag.md`).

## Dateien (alle mit Datum 22.09.2026)

| Datei | Zweck |
| --- | --- |
| `seed.sql` | Mini-Musik-DB (label/kuenstler/song), uebernommen aus `GRG-INFI/3ahwii/2026-09-29_rep-ohne-node/seed-musik-mini.sql` |
| `queries.sql` | **Die Abgabe:** Q1-Q5, je mit Kommentar |
| `leseauftrag.md` | **Leseauftrag:** Drizzle vs. Prisma 2026 samt ausfuehrlicher Transferfrage (Frage 6) |
| `main.ts` | Runner: frische `musik.db` + alle Queries ausgeben (`deno task run`) |
| `main_test.ts` | 5 Tests, einer je Query (`deno task test`) |
| `deno.json` | `nodeModulesDir: "none"` (kein Node/npm), Tasks run/test |

Konventionen: SQL-Keywords GROSS, deutsche Kommentare, `deno fmt` (2 Spaces).
`musik.db` wird lokal erzeugt und **nicht** committet (Root-`.gitignore`: `*.db`).

## Die 5 Queries

| # | Was sie beantwortet | Erwartung auf dem Seed |
| --- | --- | --- |
| Q1 | Top-5-Kuenstler nach Track-Anzahl | Auer (3) oben, 5 Zeilen |
| Q2 | Kuenstlerpaare desselben Labels (Self-JOIN) | 4 Paare (Auer-Beck; Cevik-Demir/-Egger; Demir-Egger), Frei fehlt (NULL) |
| Q3 | Labels mit > 1 Kuenstler (HAVING) | Nordklang (2), Suedton (3) |
| Q4 | `COUNT(*)` vs. `COUNT(label_id)` | 6 vs. 5 - Frei hat kein Label |
| Q5 | Kuenstler mit 2+ langen Songs (WHERE + HAVING) | nur Auer (2) |

---

## Leseauftrag & Transferfrage (Frage 6)

Die vollstaendige Ausarbeitung aller Fragen befindet sich in [`leseauftrag.md`](./leseauftrag.md).

### Zusammenfassung Transferfrage 6 (Deno, Prisma 7, Drizzle, SQL-First)
Unsere Entwicklungsumgebung basiert auf Deno mit nativem `node:sqlite`, was ein schlankes, zero-config Datenbanksystem ohne externe C++-Build-Ketten garantiert. Prisma 7 erfordert hingegen unter Node/Deno fuer SQLite zwingend Adapter-Pakete wie `@prisma/adapter-better-sqlite3`, was die Toolchain unnoetig aufblaeht und durch npm-latest-Verweise auf 8.0.0-Release-Candidates instabil macht. Didaktisch muss zunaechst reines SQL im Vordergrund stehen, damit das relationale Datenmodell, Indizes, Joins und Gruppierungen mental gefestigt werden, bevor Bibliotheken diese Grundlagen verdecken. Wenn spaeter ein ORM evaluiert wird, spricht die minimale Runtime von rund 12 KB und die direkte `node:sqlite`-Kompatibilitaet klar fuer Drizzle. Drizzle unterstuetzt unser SQL-Verstaendnis durch transparente TypeScript-Query-Builder, waehrend Prisma zusaetzliche Komplexitaet durch DSL und Codegenerierung einfuehrt.

---

## Manuell testen (in diesem Ordner)

```powershell
deno task test   # 5 Tests, alle muessen ok sein
deno task run    # alle 5 Ergebnistabellen anzeigen
deno fmt --check # Format pruefen
deno lint        # Lint pruefen
```

Ohne Deno, nur sqlite3-CLI (PowerShell 5.1 braucht die Pipe statt `<`):

```powershell
Get-Content seed.sql -Raw | sqlite3 musik.db
Get-Content queries.sql -Raw | sqlite3 musik.db
```
