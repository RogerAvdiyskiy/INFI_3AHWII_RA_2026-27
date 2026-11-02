// src/queries.js - 3NF-Queries und Konsistenz-Demonstration
import { fileURLToPath } from "node:url";
import path from "node:path";
import { prisma } from "./prisma.js";

// 1. Rekonstruktion: Alle Bestellungen mit Positionen, Tracks und PLZ/Ort (JOIN)
export async function rekonstruiereBestellungen() {
  const positionen = await prisma.bestellposition.findMany({
    include: {
      bestellung: {
        include: {
          plzRel: true,
        },
      },
      track: true,
    },
    orderBy: [
      { bestellNr: "asc" },
      { trackId: "asc" },
    ],
  });

  return positionen.map((p) => ({
    bestellNr: p.bestellNr,
    kunde: p.bestellung.kunde,
    plz: p.bestellung.plz,
    ort: p.bestellung.plzRel.ort,
    trackId: p.trackId,
    trackTitel: p.track.titel,
    dauerSek: p.track.dauerSek,
    menge: p.menge,
  }));
}

// 2. Quiz 1: Konten mit zugehoeriger Bank
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

// 3. Quiz 2: Schueler mit Klassensprecher
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

// 4. Nachweis 3NF-Konsistenz: Ort an 1 Stelle aendern, alle Bestellungen konsistent.
// Wichtig fuer Idempotenz & saubere DB: Originalzustand wird im finally-Block wiederhergestellt.
export async function demonstriere3nfKonsistenz() {
  const original = await prisma.plz.findUnique({ where: { plz: "1020" } });
  try {
    // Temporaeres Update an der Wurzel (PLZ-Tabelle)
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
  } finally {
    // Sauberes Ruecksetzen: Hinterlaesst keine Seiteneffekte in der Datenbank
    if (original) {
      await prisma.plz.update({
        where: { plz: "1020" },
        data: { ort: original.ort },
      });
    }
  }
}

async function main() {
  console.log("=== 1) Rekonstruierte Bestellungen (JOIN via Prisma include) ===");
  console.table(await rekonstruiereBestellungen());

  console.log("\n=== 2) Quiz 1: Konten & Banken (3NF aufgeloest) ===");
  console.table(await zeigeKontenMitBank());

  console.log("\n=== 3) Quiz 2: Schueler & Klassen (3NF aufgeloest) ===");
  console.table(await zeigeSchuelerMitKlasse());

  console.log("\n=== 4) 3NF-Konsistenzprobe (Update auf PLZ 1020 mit Rollback) ===");
  console.table(await demonstriere3nfKonsistenz());
}

const isDirectRun = Boolean(
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()
);

if (isDirectRun) {
  main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
