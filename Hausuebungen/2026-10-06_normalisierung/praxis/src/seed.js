// src/seed.js - Befuellen der normalisierten 3NF-Tabellen (idempotent: leeren -> befuellen)
import { fileURLToPath } from "node:url";
import path from "node:path";
import { prisma } from "./prisma.js";

export async function seed() {
  // Reihenfolge beachten wegen Fremdschluessel-Constraints (Kind-Tabellen zuerst leeren)
  await prisma.bestellposition.deleteMany();
  await prisma.bestellung.deleteMany();
  await prisma.track.deleteMany();
  await prisma.plz.deleteMany();
  await prisma.konto.deleteMany();
  await prisma.bank.deleteMany();
  await prisma.schueler.deleteMany();
  await prisma.klasse.deleteMany();

  // 1. PLZ-Stammdaten (3NF: Ort haengt ausschliesslich an der PLZ)
  await prisma.plz.createMany({
    data: [
      { plz: "1020", ort: "Wien" },
      { plz: "4020", ort: "Linz" },
      { plz: "8010", ort: "Graz" },
    ],
  });

  // 2. Track-Katalog (2NF: Titel & Dauer haengen voll vom eigenen PK track_id ab)
  await prisma.track.createMany({
    data: [
      { id: 1, titel: "Silent Lines", dauerSek: 215 },
      { id: 2, titel: "Night Ferry", dauerSek: 240 },
      { id: 3, titel: "Dust Choir", dauerSek: 198 },
    ],
  });

  // 3. Bestellungen (Kopfdaten: referenzieren PLZ per FK)
  await prisma.bestellung.createMany({
    data: [
      { bestellNr: 101, kunde: "Auer", plz: "1020" },
      { bestellNr: 102, kunde: "Beck", plz: "1020" },
      { bestellNr: 103, kunde: "Cevik", plz: "4020" },
    ],
  });

  // 4. Bestellpositionen (1NF: atomare Einzelpositionen, zusammengesetzter PK)
  await prisma.bestellposition.createMany({
    data: [
      { bestellNr: 101, trackId: 1, menge: 1 },
      { bestellNr: 101, trackId: 2, menge: 2 },
      { bestellNr: 102, trackId: 1, menge: 1 },
      { bestellNr: 102, trackId: 3, menge: 1 },
      { bestellNr: 103, trackId: 2, menge: 3 },
    ],
  });

  // 5. Quiz 1: Bank & Konto (3NF: Bankname haengt an BLZ, nicht an IBAN)
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

  // 6. Quiz 2: Klasse & Schueler (3NF: Klassensprecher haengt an Klasse, nicht an MatrNr)
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

  console.log("Seed erfolgreich durchgefuehrt: Alle 3NF-Tabellen befuellt.");
}

const isDirectRun = Boolean(
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()
);

if (isDirectRun) {
  seed()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
