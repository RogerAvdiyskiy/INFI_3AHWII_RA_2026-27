// demo.ts - Drizzle ORM Einstieg (Lesen, Schreiben, Auswerten, toSQL-Inspektion)
// Ausfuehren mit: deno task demo
import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { oeffneDb } from "./db.ts";
import { album, artist, track } from "./schema.ts";

// Vor jedem Lauf bestehende Testdatenbank aufraeumen
await Deno.remove("musik.db").catch(() => {});
const db = oeffneDb("musik.db");

console.log("=== 1) Schreiben: Insert mit .returning() ===");
const aera = await db.insert(artist)
  .values({ name: "Aera", gruendungsjahr: 1999 })
  .returning();
const nova = await db.insert(artist)
  .values({ name: "Nova", gruendungsjahr: 2012 })
  .returning();
const stille = await db.insert(album)
  .values({ titel: "Silent Lines", jahr: 2015, artistId: aera[0].id })
  .returning();
const night = await db.insert(album)
  .values({ titel: "Night Ferry", jahr: 2012, artistId: nova[0].id })
  .returning();
await db.insert(track)
  .values({ titel: "Silent Lines", dauerSek: 215, albumId: stille[0].id });
await db.insert(track)
  .values({ titel: "Echo Room", dauerSek: 187, albumId: stille[0].id });
await db.insert(track)
  .values({ titel: "Echo Waves", dauerSek: 242, albumId: stille[0].id });
await db.insert(track)
  .values({ titel: "Ferry Theme", dauerSek: 195, albumId: night[0].id });
console.log("Katalog erfolgreich aufgebaut.");

console.log("\n=== 2) Lesson-Vorhersage-Queries (toSQL-Inspektion) ===");
// Vorhersage a: Filter nach Gruendungsjahr
const queryA = db.select().from(artist).where(eq(artist.gruendungsjahr, 1999));
console.log("Query a SQL:   ", queryA.toSQL().sql);
console.log("Query a Params:", queryA.toSQL().params);
console.log("Query a Result:", await queryA);

// Vorhersage b: Count von Alben fuer Artist 1
const queryB = db.select({ n: count() }).from(album).where(eq(album.artistId, 1));
console.log("Query b SQL:   ", queryB.toSQL().sql);
console.log("Query b Params:", queryB.toSQL().params);
console.log("Query b Result:", await queryB);

console.log("\n=== 3) Geforderte HUE-Queries ===");

// 1. Aeltestes Album (orderBy asc + limit 1)
const qAeltestes = db.select().from(album).orderBy(asc(album.jahr)).limit(1);
console.log("1. Aeltestes Album SQL:   ", qAeltestes.toSQL().sql);
console.log("1. Aeltestes Album Params:", qAeltestes.toSQL().params);
const aeltestesResult = await qAeltestes;
console.log("1. Aeltestes Album Result:", aeltestesResult[0].titel, `(${aeltestesResult[0].jahr})`);

// 2. Tracks eines Albums mit Titel-Anfang 'Echo' (and + eq + like)
const qEcho = db.select().from(track)
  .where(and(eq(track.albumId, stille[0].id), like(track.titel, "Echo%")));
console.log("2. Tracks 'Echo%' SQL:   ", qEcho.toSQL().sql);
console.log("2. Tracks 'Echo%' Params:", qEcho.toSQL().params);
const echoResult = await qEcho;
console.log("2. Tracks 'Echo%' Result:", echoResult.map((t) => t.titel));

// 3. Anzahl Tracks je Album (count + groupBy ueber innerJoin)
const qTracksProAlbum = db.select({
  albumId: album.id,
  titel: album.titel,
  tracks: count(),
})
  .from(track)
  .innerJoin(album, eq(track.albumId, album.id))
  .groupBy(album.id);
console.log("3. Tracks pro Album SQL:   ", qTracksProAlbum.toSQL().sql);
console.log("3. Tracks pro Album Result:", await qTracksProAlbum);

console.log("\n=== 4) Aendern & Loeschen ===");
await db.update(track)
  .set({ dauerSek: 220 })
  .where(and(eq(track.albumId, stille[0].id), like(track.titel, "Silent%")));
const korrigiert = await db.select().from(track).where(eq(track.titel, "Silent Lines"));
console.log("Dauer nach Update:", korrigiert[0].dauerSek, "Sekunden");

await db.delete(track).where(eq(track.titel, "Echo Room"));
const verbleibend = await db.select({ anzahl: count() }).from(track);
console.log("Verbleibende Tracks:", verbleibend[0].anzahl);

db.$client.close();
