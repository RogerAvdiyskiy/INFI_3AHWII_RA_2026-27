# AGENTS.md — INFI 3AHWII (persönliches Repo)

Projekt-Anweisung für Coding-Agenten (opencode). HÜ vom 15.09.2026 (X-Gruppe):
per `/init` erstellt und an dieses Repo angepasst.

## Stack

- **Deno 2 + TypeScript**, `node:sqlite` für SQLite. Kein Node, kein `npm:`,
  kein `node_modules` (`"nodeModulesDir": "none"` in `deno.json` je Ordner).
- **SQLite** via `sqlite3`-CLI oder `node:sqlite`. `*.db`-Dateien nie committen
  (stehen in `.gitignore`), sie werden lokal aus `.sql`-Seeds erzeugt.

## Stil

- **SQL:** Keywords GROSS (`SELECT`, `JOIN`, `WHERE`), 2 Spaces Einrückung.
- **Kommentare:** Deutsch. Jede Abgabe-Query bekommt einen Kommentar,
  was sie beantwortet.
- **Format:** `deno fmt` (2 Spaces, doppelte Anführungszeichen, Semikolons).
- **Dateinamen:** `snake_case` (z. B. `queries.sql`, `seed.sql`, `main_test.ts`).

## Ordner-Schema

- `Hausuebungen/<YYYY-MM-DD>_<thema>/` je Hausübung: `README.md` (Stellung +
  Datum), Abgabedateien, ggf. `main.ts`-Runner + `main_test.ts` + `deno.json`.
- `Mitarbeit/`: Mitschriften. `Uebungen/`: freies Üben. `sqlite-datenbanken/`:
  lokale DB-Dateien (nicht committen).

## Arbeitsregeln

- Keine Secrets/API-Keys in Prompts oder Repo.
- Änderungen des Agenten immer per Diff prüfen, bevor committet wird.
- Kleine Commits mit sprechenden Messages. Committen nur auf Anweisung.
- Vor Abgabe immer: `deno fmt --check`, `deno lint`, `deno task test`
  (wo vorhanden), Queries zusätzlich per `sqlite3`-CLI gegenprüfen.
