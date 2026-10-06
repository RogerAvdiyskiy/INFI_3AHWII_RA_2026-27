-- seed.sql — Beispieldaten (mindestens 3 Zeilen pro Tabelle) für die 3NF-Tabellen
-- Ausführen mit: sqlite3 normalisierung-3nf.db < seed.sql

PRAGMA foreign_keys = ON;

----------------------------------------------------------------------
-- Teil 2: Beispieldaten für Bestellung, PLZ, Track, Bestellposition
----------------------------------------------------------------------

INSERT INTO plz (plz, ort) VALUES
  ('1020', 'Wien'),
  ('4020', 'Linz'),
  ('8010', 'Graz');

INSERT INTO track (track_id, titel, dauer_sek) VALUES
  (1, 'Silent Lines', 215),
  (2, 'Night Ferry',  240),
  (3, 'Dust Choir',   198);

INSERT INTO bestellung (bestell_nr, kunde, plz) VALUES
  (101, 'Auer',  '1020'),
  (102, 'Beck',  '1020'),
  (103, 'Cevik', '4020');

INSERT INTO bestellposition (bestell_nr, track_id, menge) VALUES
  (101, 1, 1),
  (101, 2, 2),
  (102, 1, 1),
  (102, 3, 1),
  (103, 2, 3);

----------------------------------------------------------------------
-- Teil 3: Beispieldaten für Quiz-Tabelle 1 (Bank / Konto) — je 3 Zeilen
----------------------------------------------------------------------

INSERT INTO bank (blz, bankname) VALUES
  ('12000', 'Bank Austria'),
  ('20111', 'Erste Bank'),
  ('32000', 'Raiffeisenlandesbank');

INSERT INTO konto (iban, inhaber, blz) VALUES
  ('AT611200000012345678', 'Anna Auer',   '12000'),
  ('AT892011100098765432', 'Bernd Beck',  '20111'),
  ('AT422011100055443322', 'Clara Cevik', '20111');

----------------------------------------------------------------------
-- Teil 3: Beispieldaten für Quiz-Tabelle 2 (Klasse / Schüler) — je 3 Zeilen
----------------------------------------------------------------------

INSERT INTO klasse (klasse, klassensprecher) VALUES
  ('3AHWII', 'David Demir'),
  ('3BHWII', 'Elena Egger'),
  ('3CHWII', 'Felix Frei');

INSERT INTO schueler (matr_nr, name, klasse) VALUES
  (1001, 'Anna Auer',   '3AHWII'),
  (1002, 'Bernd Beck',  '3AHWII'),
  (1003, 'Clara Cevik', '3BHWII');

----------------------------------------------------------------------
-- Bonus: Beispieldaten für Quiz-Tabelle 3 (Label / Album) — je 3 Zeilen
----------------------------------------------------------------------

INSERT INTO label (name, adresse) VALUES
  ('Nordklang',  'Hafenstr. 4, Hamburg'),
  ('Suedton',    'Ringstr. 9, Graz'),
  ('Alpenbeats', 'Museumstr. 12, Innsbruck');

INSERT INTO album (album_id, titel, label_name) VALUES
  (1, 'Silent Lines', 'Nordklang'),
  (2, 'Night Ferry',  'Nordklang'),
  (3, 'Dust Choir',   'Suedton');

