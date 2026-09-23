// main.ts — HÜ vom 22.09.2026: 5 Queries auf frischer DB ausführen und zeigen.
// Nur Deno + node:sqlite, kein Node, kein npm:, kein node_modules
// (nodeModulesDir: "none", siehe deno.json).
// Start im Ordner: deno task run
import { DatabaseSync } from "node:sqlite";

// Ordner dieser Datei (Deno 2: import.meta.dirname vorhanden)
const ordner: string = import.meta.dirname!;
const dbPfad = `${ordner}/musik.db`;

// Frische DB für reproduzierbare Abgabe (lokal, *.db steht in .gitignore)
try {
  Deno.removeSync(dbPfad);
} catch {
  // Datei gab es noch nicht -> nichts zu tun
}

const db = new DatabaseSync(dbPfad);
db.exec("PRAGMA foreign_keys = ON;");

// Seed + Queries aus den Abgabedateien laden
db.exec(Deno.readTextFileSync(`${ordner}/seed.sql`));
const queriesDatei = Deno.readTextFileSync(`${ordner}/queries.sql`);

// Datei in 5 Einzel-Queries teilen: erst reine Kommentarzeilen entfernen
// (darin dürfen Semikolons stehen), dann bei Semikolon trennen
const ohneKommentare = queriesDatei
  .split("\n")
  .filter((zeile) => !zeile.trim().startsWith("--"))
  .join("\n");
const queries = ohneKommentare
  .split(";")
  .map((q) => q.trim())
  .filter((q) => q.length > 0);

const namen = [
  "Q1: Top-5-Künstler nach Track-Anzahl",
  "Q2: Künstlerpaare desselben Labels (Self-JOIN)",
  "Q3: Labels mit mehr als einem Künstler (HAVING)",
  "Q4: COUNT(*) vs. COUNT(label_id)",
  "Q5: Künstler mit 2+ langen Songs (WHERE + HAVING)",
];

queries.forEach((sql, i) => {
  console.log(`\n--- ${namen[i] ?? `Query ${i + 1}`} ---`);
  console.table(db.prepare(sql).all());
});

db.close();
console.log(`\nFertig. DB: ${dbPfad}`);
