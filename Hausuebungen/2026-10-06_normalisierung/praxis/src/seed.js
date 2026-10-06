// src/seed.js — Befüllen der normalisierten 3NF-Tabellen (idempotent: leeren -> befüllen)
import { prisma } from "./prisma.js";

export async function seed() {
  // 1. Zuerst abhängige Kindtabellen leeren (wegen Foreign Key Constraints)
  await prisma.bestellposition.deleteMany();
  await prisma.bestellung.deleteMany();
  await prisma.track.deleteMany();
  await prisma.plz.deleteMany();

  await prisma.konto.deleteMany();
  await prisma.bank.deleteMany();

  await prisma.schueler.deleteMany();
  await prisma.klasse.deleteMany();

  // 2. PLZ anlegen (3NF-Faktentabelle)
  await prisma.plz.createMany({
    data: [
      { plz: "1020", ort: "Wien" },
      { plz: "4020", ort: "Linz" },
      { plz: "8010", ort: "Graz" },
    ],
  });

  // 3. Tracks anlegen (2NF-Entität)
  await prisma.track.createMany({
    data: [
      { id: 1, titel: "Silent Lines", dauerSek: 215 },
      { id: 2, titel: "Night Ferry", dauerSek: 240 },
      { id: 3, titel: "Dust Choir", dauerSek: 198 },
    ],
  });

  // 4. Bestellungen anlegen
  await prisma.bestellung.createMany({
    data: [
      { bestellNr: 101, kunde: "Auer", plz: "1020" },
      { bestellNr: 102, kunde: "Beck", plz: "1020" },
      { bestellNr: 103, kunde: "Cevik", plz: "4020" },
    ],
  });

  // 5. Bestellpositionen anlegen (1NF: atomare Zeilen; 2NF: zusammengesetzter Key)
  await prisma.bestellposition.createMany({
    data: [
      { bestellNr: 101, trackId: 1, menge: 1 },
      { bestellNr: 101, trackId: 2, menge: 2 },
      { bestellNr: 102, trackId: 1, menge: 1 },
      { bestellNr: 102, trackId: 3, menge: 1 },
      { bestellNr: 103, trackId: 2, menge: 3 },
    ],
  });

  // 6. Bank & Konto (Quiz 1)
  await prisma.bank.createMany({
    data: [
      { blz: "12000", bankname: "Bank Austria" },
      { blz: "20111", bankname: "Erste Bank" },
      { blz: "32000", bankname: "Raiffeisenlandesbank" },
    ],
  });

  await prisma.konto.createMany({
    data: [
      { iban: "AT611200000012345678", inhaber: "Anna Auer", blz: "12000" },
      { iban: "AT892011100098765432", inhaber: "Bernd Beck", blz: "20111" },
      { iban: "AT422011100055443322", inhaber: "Clara Cevik", blz: "20111" },
    ],
  });

  // 7. Klasse & Schüler (Quiz 2)
  await prisma.klasse.createMany({
    data: [
      { klasse: "3AHWII", klassensprecher: "David Demir" },
      { klasse: "3BHWII", klassensprecher: "Elena Egger" },
      { klasse: "3CHWII", klassensprecher: "Felix Frei" },
    ],
  });

  await prisma.schueler.createMany({
    data: [
      { matrNr: 1001, name: "Anna Auer", klasseName: "3AHWII" },
      { matrNr: 1002, name: "Bernd Beck", klasseName: "3AHWII" },
      { matrNr: 1003, name: "Clara Cevik", klasseName: "3BHWII" },
    ],
  });

  console.log("Seed erfolgreich durchgeführt: Alle 3NF-Tabellen befüllt.");
}

import { fileURLToPath } from "node:url";

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun || !process.argv[1].includes("test")) {
  seed()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
