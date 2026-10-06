// test/normalisierung.test.js — Automatische Tests zur 3NF-Verifikation mit node:test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "../src/prisma.js";
import { seed } from "../src/seed.js";
import {
  rekonstruiereBestellungen,
  zeigeKontenMitBank,
  zeigeSchuelerMitKlasse,
  demonstriere3nfKonsistenz,
} from "../src/queries.js";

before(async () => {
  await seed();
});

after(async () => {
  await prisma.$disconnect();
});

test("1NF: Jede Bestellposition ist eine atomare Zeile (keine Listen im Attribut)", async () => {
  const positionen = await prisma.bestellposition.findMany({
    where: { bestellNr: 101 },
  });
  assert.equal(positionen.length, 2, "Bestellung 101 hat genau 2 einzelne Positionen");
  assert.ok(positionen.every((p) => typeof p.trackId === "number"));
});

test("2NF: Track existiert unabhängig von Bestellungen (keine partielle Abhängigkeit)", async () => {
  const tracks = await prisma.track.findMany();
  assert.equal(tracks.length, 3, "Genau 3 eindeutige Tracks im Katalog");
  const silentLines = await prisma.track.findUnique({ where: { id: 1 } });
  assert.equal(silentLines.titel, "Silent Lines");
});

test("3NF: Ort hängt nur an PLZ (keine transitive Abhängigkeit in Bestellung)", async () => {
  const bestellungen = await prisma.bestellung.findMany({
    where: { plz: "1020" },
  });
  assert.equal(bestellungen.length, 2, "2 Bestellungen teilen dieselbe PLZ");
  // In der Bestelltabelle selbst existiert keine redundante Spalte 'ort'
  assert.ok(!("ort" in bestellungen[0]));
});

test("Interleaving: Vollständige Rekonstruktion aller Bestellungen mit JOIN", async () => {
  const rows = await rekonstruiereBestellungen();
  assert.equal(rows.length, 5, "Insgesamt 5 Positionen über 3 Bestellungen");
  const erste = rows[0];
  assert.equal(erste.bestellNr, 101);
  assert.equal(erste.kunde, "Auer");
  assert.equal(erste.trackTitel, "Silent Lines");
});

test("Quiz 1: Bank & Konto sind sauber 3NF-normalisiert", async () => {
  const konten = await zeigeKontenMitBank();
  assert.equal(konten.length, 3);
  const auerKonto = konten.find((k) => k.inhaber === "Anna Auer");
  assert.equal(auerKonto.bankname, "Bank Austria");
});

test("Quiz 2: Klasse & Schüler sind sauber 3NF-normalisiert", async () => {
  const schueler = await zeigeSchuelerMitKlasse();
  assert.equal(schueler.length, 3);
  const auer = schueler.find((s) => s.name === "Anna Auer");
  assert.equal(auer.klasse, "3AHWII");
  assert.equal(auer.klassensprecher, "David Demir");
});

test("Anomaliefreiheit: Update auf PLZ aktualisiert alle verknüpften Bestellungen konsistent", async () => {
  const aktualisiert = await demonstriere3nfKonsistenz();
  assert.equal(aktualisiert.length, 2);
  assert.equal(aktualisiert[0].ort, "Wien (Hauptstadt)");
  assert.equal(aktualisiert[1].ort, "Wien (Hauptstadt)");
});

