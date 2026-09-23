// main_test.ts — HÜ vom 22.09.2026: alle 5 Queries gegen den Seed prüfen.
// Eigenständig: Seed wird in eine Memory-DB geladen, keine Datei nötig.
// Start im Ordner: deno task test
import { assertEquals } from "@std/assert";
import { DatabaseSync } from "node:sqlite";

const ordner: string = import.meta.dirname!;

// Frische Memory-DB mit seed.sql als Stand
function openSeed(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(Deno.readTextFileSync(`${ordner}/seed.sql`));
  return db;
}

Deno.test("Q1: Top-Künstler ist Auer mit 3 Tracks (5 Zeilen)", () => {
  const db = openSeed();
  const rows = db.prepare(`
    SELECT k.name AS kuenstler, COUNT(*) AS tracks
    FROM kuenstler AS k
    INNER JOIN song AS s ON s.kuenstler_id = k.id
    GROUP BY k.id, k.name
    ORDER BY tracks DESC
    LIMIT 5
  `).all() as { kuenstler: string; tracks: number }[];
  assertEquals(rows.length, 5);
  assertEquals(rows[0], { kuenstler: "Auer", tracks: 3 });
  db.close();
});

Deno.test("Q2: 4 Label-Paare, keine Selbst-/Doppelpaare, Frei fehlt", () => {
  const db = openSeed();
  const rows = db.prepare(`
    SELECT x.name AS a, y.name AS b, l.name AS label
    FROM kuenstler AS x
    INNER JOIN kuenstler AS y ON x.label_id = y.label_id AND x.id < y.id
    INNER JOIN label AS l ON l.id = x.label_id
    ORDER BY a, b
  `).all() as { a: string; b: string; label: string }[];
  assertEquals(rows, [
    { a: "Auer", b: "Beck", label: "Nordklang" },
    { a: "Cevik", b: "Demir", label: "Suedton" },
    { a: "Cevik", b: "Egger", label: "Suedton" },
    { a: "Demir", b: "Egger", label: "Suedton" },
  ]);
  db.close();
});

Deno.test("Q3: Nordklang (2) und Suedton (3) haben > 1 Künstler", () => {
  const db = openSeed();
  const rows = db.prepare(`
    SELECT l.name AS label, COUNT(*) AS kuenstler
    FROM kuenstler AS k
    INNER JOIN label AS l ON l.id = k.label_id
    GROUP BY l.id, l.name
    HAVING COUNT(*) > 1
    ORDER BY l.name
  `).all() as { label: string; kuenstler: number }[];
  assertEquals(rows, [
    { label: "Nordklang", kuenstler: 2 },
    { label: "Suedton", kuenstler: 3 },
  ]);
  db.close();
});

Deno.test("Q4: 6 Künstler gesamt, 5 mit Label (Frei ohne)", () => {
  const db = openSeed();
  const row = db.prepare(`
    SELECT COUNT(*) AS alle, COUNT(label_id) AS mit_label FROM kuenstler
  `).get() as { alle: number; mit_label: number };
  assertEquals(row, { alle: 6, mit_label: 5 });
  db.close();
});

Deno.test("Q5: nur Auer hat 2+ lange Songs (> 200 s)", () => {
  const db = openSeed();
  const rows = db.prepare(`
    SELECT k.name AS kuenstler, COUNT(*) AS lange_songs
    FROM kuenstler AS k
    INNER JOIN song AS s ON s.kuenstler_id = k.id
    WHERE s.dauer_sek > 200
    GROUP BY k.id, k.name
    HAVING COUNT(*) >= 2
  `).all() as { kuenstler: string; lange_songs: number }[];
  assertEquals(rows, [{ kuenstler: "Auer", lange_songs: 2 }]);
  db.close();
});
