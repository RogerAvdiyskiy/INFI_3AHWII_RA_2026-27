# HUE vom 13.10.2026 - Drizzle ORM Einstieg (Deno & SQLite)

**Klasse:** 3AHWII (X-Gruppe) * **Fach:** INFI (KM5, WS 2026/27)  
**Thema:** Drizzle ORM, Deno Runtime, natives `node:sqlite`, TypeScript-Schemas, toSQL-Analyse  
**Bezug:** `unterricht/KM5-05-drizzle-orm/aufgabe.md` & `lesson.html`

---

## 1. Vorhersage (vor dem Ausfuehren)

Vor der Ausfuehrung wurde analysiert, welches SQL Drizzle aus den beiden Lesson-Queries generiert:

### Query a) `db.select().from(artist).where(eq(artist.gruendungsjahr, 1999))`
* **Erzeugtes SQL:**
  ```sql
  select "id", "name", "gruendungsjahr" from "artist" where "artist"."gruendungsjahr" = ?
  ```
* **Spaltenliste:** Alle Spalten des `artist`-Schemas (`"id"`, `"name"`, `"gruendungsjahr"`).
* **WHERE-Klausel:** `"artist"."gruendungsjahr" = ?`
* **Parameter:** `[1999]`  
  *Wichtig:* Drizzle fuegt Werte niemals direkt als Zeichenkette in den SQL-String ein, sondern nutzt zwingend parametrisierte Prepared Statements.

### Query b) `db.select({ n: count() }).from(album).where(eq(album.artistId, 1))`
* **Erzeugtes SQL:**
  ```sql
  select count(*) from "album" where "album"."artist_id" = ?
  ```
* **Spaltenliste:** `count(*)` (im Result-Objekt als Eigenschaft `n` typisiert).
* **WHERE-Klausel:** `"album"."artist_id" = ?` (Beachte das Mapping vom CamelCase `artistId` im TypeScript-Code zum DB-Spaltennamen `"artist_id"`).
* **Parameter:** `[1]`

---

## 2. Drei ergaenzte HUE-Queries in `demo.ts`

Gemaess Aufgabenstellung wurden drei praezise Abfragen ergaenzt:

### 1. Aeltestes Album (`orderBy` + `limit`)
```typescript
const aeltestes = await db.select()
  .from(album)
  .orderBy(asc(album.jahr))
  .limit(1);
```
* **Erzeugtes SQL:** `select "id", "titel", "jahr", "artist_id" from "album" order by "album"."jahr" asc limit ?`
* **Parameter:** `[1]`
* **Ergebnis:** `Night Ferry (2012)`

### 2. Tracks eines Albums mit Titel-Anfang "Echo" (`and` + `eq` + `like`)
```typescript
const echoTracks = await db.select()
  .from(track)
  .where(and(eq(track.albumId, stille[0].id), like(track.titel, "Echo%")));
```
* **Erzeugtes SQL:** `select "id", "titel", "dauer_sek", "album_id" from "track" where (("track"."album_id" = ?) and ("track"."titel" like ?))`
* **Parameter:** `[1, "Echo%"]`
* **Ergebnis:** `["Echo Room", "Echo Waves"]`

### 3. Anzahl Tracks je Album (`count` + `groupBy`)
```typescript
const tracksProAlbum = await db.select({
  albumId: album.id,
  titel: album.titel,
  tracks: count(),
})
  .from(track)
  .innerJoin(album, eq(track.albumId, album.id))
  .groupBy(album.id);
```
* **Erzeugtes SQL:** `select "album"."id", "album"."titel", count(*) from "track" inner join "album" on "track"."album_id" = "album"."id" group by "album"."id"`
* **Ergebnis:** `Silent Lines: 3 Tracks, Night Ferry: 1 Track`

---

## 3. SQL-Vergleich (Interleaving)

Gegenueberstellung der Query "Tracks pro Album" in Drizzle vs. reinem SQL:

| Klausel / Baustein | Reines SQL | Drizzle TypeScript-Code |
| :--- | :--- | :--- |
| **Projektion / Spalten** | `SELECT album.titel, count(*) AS tracks` | `db.select({ titel: album.titel, tracks: count() })` |
| **Primaere Tabelle** | `FROM track` | `.from(track)` |
| **Verknuepfung** | `INNER JOIN album ON track.album_id = album.id` | `.innerJoin(album, eq(track.albumId, album.id))` |
| **Gruppierung** | `GROUP BY album.id` | `.groupBy(album.id)` |

**Erkenntnis:**  
Drizzle erfindet keine neue Abfragesprache wie Prismas DSL, sondern bildet die relationalen SQL-Klauseln 1:1 als typisierte TypeScript-Methoden ab. Entwickler behalten die volle Kontrolle ueber das resultierende SQL.

---

## 4. Ausfuehrung & Nachweis

### Testergebnis (`deno task test`):
```text
Task test deno test
Check demo_test.ts
running 9 tests from ./demo_test.ts
insert mit returning liefert neue Zeile samt ID ... ok (2ms)
select mit where filtert typsicher ... ok (1ms)
Fremdschluessel verhindert verwaiste Alben ohne Artist ... ok (0ms)
update modifiziert gezielt nur betroffene Tracks ... ok (1ms)
delete entfernt genau die angegebene Zeile ... ok (1ms)
HUE-Query 1: Aeltestes Album liefert kleinstes Erscheinungsjahr ... ok (0ms)
HUE-Query 2: Tracks eines Albums mit Titel-Anfang 'Echo' (and + eq + like) ... ok (0ms)
HUE-Query 3: Anzahl Tracks je Album mit count() und groupBy() ... ok (0ms)
Parametrisierung: Werte stehen in params, niemals im Plain-SQL ... ok (0ms)

ok | 9 passed | 0 failed (16ms)
```

### Demolauf (`deno task demo`):
```text
Task demo deno run --allow-read --allow-write demo.ts
=== 1) Schreiben: Insert mit .returning() ===
Katalog erfolgreich aufgebaut.

=== 2) Lesson-Vorhersage-Queries (toSQL-Inspektion) ===
Query a SQL:    select "id", "name", "gruendungsjahr" from "artist" where "artist"."gruendungsjahr" = ?
Query a Params: [ 1999 ]
Query a Result: [ { id: 1, name: "Aera", gruendungsjahr: 1999 } ]
Query b SQL:    select count(*) from "album" where "album"."artist_id" = ?
Query b Params: [ 1 ]
Query b Result: [ { n: 1 } ]

=== 3) Geforderte HUE-Queries ===
1. Aeltestes Album SQL:    select "id", "titel", "jahr", "artist_id" from "album" order by "album"."jahr" asc limit ?
1. Aeltestes Album Params: [ 1 ]
1. Aeltestes Album Result: Night Ferry (2012)
2. Tracks 'Echo%' SQL:    select "id", "titel", "dauer_sek", "album_id" from "track" where (("track"."album_id" = ?) and ("track"."titel" like ?))
2. Tracks 'Echo%' Params: [ 1, "Echo%" ]
2. Tracks 'Echo%' Result: [ "Echo Room", "Echo Waves" ]
3. Tracks pro Album SQL:    select "album"."id", "album"."titel", count(*) from "track" inner join "album" on "track"."album_id" = "album"."id" group by "album"."id"
3. Tracks pro Album Result: [
  { albumId: 1, titel: "Silent Lines", tracks: 3 },
  { albumId: 2, titel: "Night Ferry", tracks: 1 }
]

=== 4) Aendern & Loeschen ===
Dauer nach Update: 220 Sekunden
Verbleibende Tracks: 3
```
