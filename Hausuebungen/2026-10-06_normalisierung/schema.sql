-- schema.sql — Normalisierte 3NF-Tabellen zur HÜ KM5-02 (2026-10-06)
-- Ausführen mit: sqlite3 normalisierung-3nf.db < schema.sql

PRAGMA foreign_keys = ON;

----------------------------------------------------------------------
-- Teil 2: Bestellung 3NF
----------------------------------------------------------------------

-- 1. Faktentabelle PLZ -> Ort (3NF: keine transitive Abhängigkeit in Bestellung)
DROP TABLE IF EXISTS bestellposition;
DROP TABLE IF EXISTS bestellung;
DROP TABLE IF EXISTS track;
DROP TABLE IF EXISTS plz;

CREATE TABLE plz (
  plz  TEXT PRIMARY KEY,
  ort  TEXT NOT NULL
);

-- 2. Entität Track (2NF: Track-Details hängen voll am eigenen Schlüssel track_id)
CREATE TABLE track (
  track_id  INTEGER PRIMARY KEY,
  titel     TEXT NOT NULL,
  dauer_sek INTEGER NOT NULL
);

-- 3. Haupttabelle Bestellung (verweist auf PLZ, keine Ortsduplikate)
CREATE TABLE bestellung (
  bestell_nr INTEGER PRIMARY KEY,
  kunde      TEXT NOT NULL,
  plz        TEXT NOT NULL,
  FOREIGN KEY (plz) REFERENCES plz(plz) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 4. Kindtabelle / Beziehung Bestellposition (1NF: atomare Positionen, 2NF: kein Titel hier)
CREATE TABLE bestellposition (
  bestell_nr INTEGER NOT NULL,
  track_id   INTEGER NOT NULL,
  menge      INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bestell_nr, track_id),
  FOREIGN KEY (bestell_nr) REFERENCES bestellung(bestell_nr) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES track(track_id) ON DELETE RESTRICT
);

----------------------------------------------------------------------
-- Teil 3: Eigene Quiz-Tabellen in 3NF
----------------------------------------------------------------------

-- Quiz 1: Bank & Konto (iban -> blz -> bankname aufgelöst)
DROP TABLE IF EXISTS konto;
DROP TABLE IF EXISTS bank;

CREATE TABLE bank (
  blz      TEXT PRIMARY KEY,
  bankname TEXT NOT NULL
);

CREATE TABLE konto (
  iban    TEXT PRIMARY KEY,
  inhaber TEXT NOT NULL,
  blz     TEXT NOT NULL,
  FOREIGN KEY (blz) REFERENCES bank(blz) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Quiz 2: Klasse & Schüler (matr_nr -> klasse -> klassensprecher aufgelöst)
DROP TABLE IF EXISTS schueler;
DROP TABLE IF EXISTS klasse;

CREATE TABLE klasse (
  klasse          TEXT PRIMARY KEY,
  klassensprecher TEXT NOT NULL
);

CREATE TABLE schueler (
  matr_nr INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  klasse  TEXT NOT NULL,
  FOREIGN KEY (klasse) REFERENCES klasse(klasse) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Bonus: Label & Album (album_id -> label -> label_adresse aufgelöst)
DROP TABLE IF EXISTS album;
DROP TABLE IF EXISTS label;

CREATE TABLE label (
  name    TEXT PRIMARY KEY,
  adresse TEXT NOT NULL
);

CREATE TABLE album (
  album_id   INTEGER PRIMARY KEY,
  titel      TEXT NOT NULL,
  label_name TEXT NOT NULL,
  FOREIGN KEY (label_name) REFERENCES label(name) ON UPDATE CASCADE ON DELETE RESTRICT
);

