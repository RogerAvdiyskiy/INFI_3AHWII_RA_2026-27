# HÜ vom 22.09.2026 (UE 1) — 5 Auffrischungs-Queries

**Klasse:** 3AHWII (X-Gruppe) · **Fach:** INFI (KM5, WS 2026/27) **Stellung:**
`GRG-INFI/3ahwii/lessons/0001-wiederholung-diagnose.html` §4 („genau diese 5
Auffrischungs-Queries"), Semesterplan UE 1. **Abgabeformat:** `.sql`-Datei mit
je einem Kommentar (siehe `queries.sql`).

## Dateien (alle mit Datum 22.09.2026)

| Datei          | Zweck                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `seed.sql`     | Mini-Musik-DB (label/kuenstler/song), übernommen aus `GRG-INFI/3ahwii/2026-09-29_rep-ohne-node/seed-musik-mini.sql` |
| `queries.sql`  | **Die Abgabe:** Q1–Q5, je mit Kommentar                                                                             |
| `main.ts`      | Runner: frische `musik.db` + alle Queries ausgeben (`deno task run`)                                                |
| `main_test.ts` | 5 Tests, einer je Query (`deno task test`)                                                                          |
| `deno.json`    | `nodeModulesDir: "none"` (kein Node/npm), Tasks run/test                                                            |

Konventionen: SQL-Keywords GROSS, deutsche Kommentare, `deno fmt` (2 Spaces).
`musik.db` wird lokal erzeugt und **nicht** committet (Root-`.gitignore`:
`*.db`).

## Die 5 Queries

| #  | Was sie beantwortet                           | Erwartung auf dem Seed                                                  |
| -- | --------------------------------------------- | ----------------------------------------------------------------------- |
| Q1 | Top-5-Künstler nach Track-Anzahl              | Auer (3) oben, 5 Zeilen                                                 |
| Q2 | Künstlerpaare desselben Labels (Self-JOIN)    | 4 Paare (Auer-Beck; Cevik-Demir/-Egger; Demir-Egger), Frei fehlt (NULL) |
| Q3 | Labels mit > 1 Künstler (HAVING)              | Nordklang (2), Suedton (3)                                              |
| Q4 | `COUNT(*)` vs. `COUNT(label_id)`              | 6 vs. 5 — Frei hat kein Label                                           |
| Q5 | Künstler mit 2+ langen Songs (WHERE + HAVING) | nur Auer (2)                                                            |

## Manuell testen (in diesem Ordner)

```powershell
deno task test   # 5 Tests, alle müssen ok sein
deno task run    # alle 5 Ergebnistabellen anzeigen
deno fmt --check # Format prüfen
deno lint        # Lint prüfen
```

Ohne Deno, nur sqlite3-CLI (PowerShell 5.1 braucht die Pipe statt `<`):

```powershell
Get-Content seed.sql -Raw | sqlite3 musik.db
Get-Content queries.sql -Raw | sqlite3 musik.db
```
