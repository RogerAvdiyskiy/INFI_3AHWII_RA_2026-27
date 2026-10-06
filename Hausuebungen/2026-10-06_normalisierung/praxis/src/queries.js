// src/queries.js — Relationale Abfragen und 3NF-Verifikation mit Prisma Client
import { prisma } from "./prisma.js";

// 1. Interleaving-Abfrage: Rekonstruktion der Bestellung inklusive Tracks und Ort
export async function rekonstruiereBestellungen() {
  const bestellungen = await prisma.bestellung.findMany({
    include: {
      plzRel: true,
      positionen: {
        include: {
          track: true,
        },
      },
    },
    orderBy: { bestellNr: "asc" },
  });

  return bestellungen.flatMap((b) =>
    b.positionen.map((p) => ({
      bestellNr: b.bestellNr,
      kunde: b.kunde,
      plz: b.plz,
      ort: b.plzRel.ort,
      trackId: p.trackId,
      trackTitel: p.track.titel,
      dauerSek: p.track.dauerSek,
      menge: p.menge,
    }))
  );
}

// 2. Quiz 1: Konten mit zugehörigem Banknamen
export async function zeigeKontenMitBank() {
  const konten = await prisma.konto.findMany({
    include: { bank: true },
    orderBy: { iban: "asc" },
  });
  return konten.map((k) => ({
    iban: k.iban,
    inhaber: k.inhaber,
    blz: k.blz,
    bankname: k.bank.bankname,
  }));
}

// 3. Quiz 2: Schüler mit Klassensprecher
export async function zeigeSchuelerMitKlasse() {
  const schueler = await prisma.schueler.findMany({
    include: { klasse: true },
    orderBy: { matrNr: "asc" },
  });
  return schueler.map((s) => ({
    matrNr: s.matrNr,
    name: s.name,
    klasse: s.klasseName,
    klassensprecher: s.klasse.klassensprecher,
  }));
}

// 4. Nachweis 3NF-Konsistenz: Ort an 1 Stelle ändern, alle Bestellungen konsistent
export async function demonstriere3nfKonsistenz() {
  // Update genau an der Wurzel (in der Plz-Tabelle)
  await prisma.plz.update({
    where: { plz: "1020" },
    data: { ort: "Wien (Hauptstadt)" },
  });

  // Beide Bestellungen (101 & 102) mit PLZ 1020 abfragen
  const betroffene = await prisma.bestellung.findMany({
    where: { plz: "1020" },
    include: { plzRel: true },
    orderBy: { bestellNr: "asc" },
  });

  return betroffene.map((b) => ({
    bestellNr: b.bestellNr,
    kunde: b.kunde,
    plz: b.plz,
    ort: b.plzRel.ort,
  }));
}

async function main() {
  console.log("=== 1) Rekonstruierte Bestellungen (JOIN via Prisma include) ===");
  console.table(await rekonstruiereBestellungen());

  console.log("\n=== 2) Quiz 1: Konten & Banken (3NF aufgelöst) ===");
  console.table(await zeigeKontenMitBank());

  console.log("\n=== 3) Quiz 2: Schüler & Klassen (3NF aufgelöst) ===");
  console.table(await zeigeSchuelerMitKlasse());

  console.log("\n=== 4) 3NF-Konsistenzprobe (Update auf PLZ 1020) ===");
  console.table(await demonstriere3nfKonsistenz());
}

import { fileURLToPath } from "node:url";

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
