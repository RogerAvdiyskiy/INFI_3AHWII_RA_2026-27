-- ============================================================================
-- HÜ vom 22.09.2026 (UE 1): 5 Auffrischungs-Queries auf der Musik-DB
-- Stellung: GRG-INFI/3ahwii/lessons/0001-wiederholung-diagnose.html §4
-- ("genau diese 5 Auffrischungs-Queries"), Semesterplan UE 1.
-- Voraussetzung: seed.sql (sqlite3 musik.db < seed.sql)
-- Lauffähig mit: sqlite3 musik.db < queries.sql
-- Konvention: SQL-Keywords GROSS, deutsche Kommentare.
-- ============================================================================

-- --- Q1: Top-5-Künstler nach Track-Anzahl ------------------------------------
-- Beantwortet: Wer hat die meisten Tracks? (JOIN + GROUP BY + ORDER BY DESC + LIMIT)
SELECT
  k.name AS kuenstler,
  COUNT(*) AS tracks
FROM kuenstler AS k
INNER JOIN song AS s ON s.kuenstler_id = k.id
GROUP BY k.id, k.name
ORDER BY tracks DESC
LIMIT 5;

-- --- Q2: Künstlerpaare desselben Labels --------------------------------------
-- Beantwortet: Welche Künstler teilen sich ein Label?
-- Self-JOIN mit zwei Aliasen; x.id < y.id vermeidet Selbst- und Doppelpaare.
-- Künstler ohne Label (label_id IS NULL) fallen raus: NULL = NULL ist nie TRUE.
SELECT
  x.name AS a,
  y.name AS b,
  l.name AS label
FROM kuenstler AS x
INNER JOIN kuenstler AS y ON x.label_id = y.label_id AND x.id < y.id
INNER JOIN label AS l ON l.id = x.label_id;

-- --- Q3: Labels mit mehr als einem Künstler ----------------------------------
-- Beantwortet: Welche Labels haben mehr als einen Künstler? (HAVING filtert Gruppen.)
-- Hinweis: In Lesson 0001 §4 steht "> 5" (volle DB); auf dem Mini-Seed ist die
-- Schwelle "> 1" aus der Referenz-Implementierung (2026-09-29/main.ts), damit
-- HAVING-Gruppen sichtbar bleiben (Nordklang: 2, Suedton: 3).
SELECT
  l.name AS label,
  COUNT(*) AS kuenstler
FROM kuenstler AS k
INNER JOIN label AS l ON l.id = k.label_id
GROUP BY l.id, l.name
HAVING COUNT(*) > 1;

-- --- Q4: COUNT(*) vs. COUNT(label_id) ----------------------------------------
-- Beantwortet: Wie viele Künstler gibt es, und wie viele haben ein Label?
-- Erklärung in einem Satz: COUNT(*) zählt alle 6 Zeilen, COUNT(label_id) nur die
-- 5 Zeilen mit Wert — Frei hat kein Label (NULL), darum ist die Differenz 1.
SELECT
  COUNT(*) AS alle,
  COUNT(label_id) AS mit_label
FROM kuenstler;

-- --- Q5: WHERE und HAVING kombiniert ------------------------------------------
-- Beantwortet: Welche Künstler haben mindestens 2 lange Songs (> 200 s)?
-- WHERE filtert Zeilen vor dem Gruppieren (nur lange Songs), HAVING filtert
-- Gruppen danach (nur Künstler mit mindestens 2 davon).
SELECT
  k.name AS kuenstler,
  COUNT(*) AS lange_songs
FROM kuenstler AS k
INNER JOIN song AS s ON s.kuenstler_id = k.id
WHERE s.dauer_sek > 200
GROUP BY k.id, k.name
HAVING COUNT(*) >= 2;
