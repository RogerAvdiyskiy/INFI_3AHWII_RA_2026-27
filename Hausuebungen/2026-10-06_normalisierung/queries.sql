-- queries.sql — Abfragen auf den normalisierten 3NF-Tabellen
-- Ausführen mit: sqlite3 normalisierung-3nf.db < queries.sql

PRAGMA foreign_keys = ON;

-- 1. Interleaving-Abfrage: Rekonstruktion der vollständigen Bestellung inklusive Track-Titel und Ort
SELECT 
  b.bestell_nr,
  b.kunde,
  p.plz,
  p.ort,
  bp.track_id,
  t.titel AS track_titel,
  t.dauer_sek,
  bp.menge
FROM bestellung b
JOIN plz p ON b.plz = p.plz
JOIN bestellposition bp ON b.bestell_nr = bp.bestell_nr
JOIN track t ON bp.track_id = t.track_id
ORDER BY b.bestell_nr, bp.track_id;

-- 2. Rekonstruktion Quiz 1: Konten mit zugehörigem Banknamen (JOIN)
SELECT 
  k.iban,
  k.inhaber,
  k.blz,
  b.bankname
FROM konto k
JOIN bank b ON k.blz = b.blz
ORDER BY k.iban;

-- 3. Rekonstruktion Quiz 2: Schüler mit Klassensprecher ihrer Klasse (JOIN)
SELECT 
  s.matr_nr,
  s.name AS schueler_name,
  s.klasse,
  k.klassensprecher
FROM schueler s
JOIN klasse k ON s.klasse = k.klasse
ORDER BY s.matr_nr;

-- 4. Nachweis der 3NF-Anomaliefreiheit:
-- Ändert sich der Ortsname von PLZ 1020, geschieht dies an genau 1 Stelle (in plz),
-- und alle Bestellungen zeigen sofort den neuen Ort ohne Redundanz oder Widerspruch.
UPDATE plz SET ort = 'Wien (Hauptstadt)' WHERE plz = '1020';

SELECT 
  b.bestell_nr,
  b.kunde,
  b.plz,
  p.ort
FROM bestellung b
JOIN plz p ON b.plz = p.plz
WHERE b.plz = '1020';

