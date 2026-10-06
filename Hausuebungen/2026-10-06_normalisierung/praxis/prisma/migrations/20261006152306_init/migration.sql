-- CreateTable
CREATE TABLE "Plz" (
    "plz" TEXT NOT NULL PRIMARY KEY,
    "ort" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titel" TEXT NOT NULL,
    "dauerSek" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Bestellung" (
    "bestellNr" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kunde" TEXT NOT NULL,
    "plz" TEXT NOT NULL,
    CONSTRAINT "Bestellung_plz_fkey" FOREIGN KEY ("plz") REFERENCES "Plz" ("plz") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bestellposition" (
    "bestellNr" INTEGER NOT NULL,
    "trackId" INTEGER NOT NULL,
    "menge" INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY ("bestellNr", "trackId"),
    CONSTRAINT "Bestellposition_bestellNr_fkey" FOREIGN KEY ("bestellNr") REFERENCES "Bestellung" ("bestellNr") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Bestellposition_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bank" (
    "blz" TEXT NOT NULL PRIMARY KEY,
    "bankname" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Konto" (
    "iban" TEXT NOT NULL PRIMARY KEY,
    "inhaber" TEXT NOT NULL,
    "blz" TEXT NOT NULL,
    CONSTRAINT "Konto_blz_fkey" FOREIGN KEY ("blz") REFERENCES "Bank" ("blz") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Klasse" (
    "klasse" TEXT NOT NULL PRIMARY KEY,
    "klassensprecher" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Schueler" (
    "matrNr" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "klasseName" TEXT NOT NULL,
    CONSTRAINT "Schueler_klasseName_fkey" FOREIGN KEY ("klasseName") REFERENCES "Klasse" ("klasse") ON DELETE RESTRICT ON UPDATE CASCADE
);
