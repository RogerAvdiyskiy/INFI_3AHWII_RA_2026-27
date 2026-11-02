// demo_test.ts - Drizzle ORM Unit-Tests (In-Memory-DB)
import { assertEquals } from "@std/assert";
import { and, asc, count, desc, eq, like } from "drizzle-orm";
import { oeffneDb } from "./db.ts";
import { album, artist, track } from "./schema.ts";

function testDb() {
  return oeffneDb(":memory:");
}

Deno.test("insert mit returning liefert neue Zeile samt ID", async () => {
  const db = testDb();
  const neu = await db.insert(artist)
    .values({ name: "Aera", gruendungsjahr: 1999 })
    .returning();
  assertEquals(neu.length, 1);
  assertEquals(neu[0].id, 1);
  assertEquals(neu[0].name, "Aera");
});

Deno.test("select mit where filtert typsicher", async () => {
  const db = testDb();
  await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 });
  await db.insert(artist).values({ name: "Nova", gruendungsjahr: 2012 });
  const treffer = await db.select().from(artist)
    .where(eq(artist.gruendungsjahr, 2012));
  assertEquals(treffer.length, 1);
  assertEquals(treffer[0].name, "Nova");
});

Deno.test("Fremdschluessel verhindert verwaiste Alben ohne Artist", async () => {
  const db = testDb();
  await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 });
  const fehler = await db.insert(album)
    .values({ titel: "Ohne Herkunft", jahr: 2020, artistId: 99 })
    .catch((e) => e);
  assertEquals(String(fehler?.cause ?? fehler).includes("FOREIGN KEY"), true);
});

Deno.test("update modifiziert gezielt nur betroffene Tracks", async () => {
  const db = testDb();
  const a = await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 }).returning();
  const al = await db.insert(album).values({ titel: "Silent Lines", jahr: 2015, artistId: a[0].id }).returning();
  await db.insert(track).values({ titel: "Silent Lines", dauerSek: 215, albumId: al[0].id });
  await db.insert(track).values({ titel: "Echo Room", dauerSek: 187, albumId: al[0].id });

  await db.update(track)
    .set({ dauerSek: 220 })
    .where(and(eq(track.albumId, al[0].id), like(track.titel, "Silent%")));

  const tracks = await db.select().from(track).orderBy(track.id);
  assertEquals(tracks[0].dauerSek, 220);
  assertEquals(tracks[1].dauerSek, 187);
});

Deno.test("delete entfernt genau die angegebene Zeile", async () => {
  const db = testDb();
  const a = await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 }).returning();
  const al = await db.insert(album).values({ titel: "Silent Lines", jahr: 2015, artistId: a[0].id }).returning();
  await db.insert(track).values({ titel: "Silent Lines", dauerSek: 215, albumId: al[0].id });
  await db.insert(track).values({ titel: "Echo Room", dauerSek: 187, albumId: al[0].id });

  await db.delete(track).where(eq(track.titel, "Echo Room"));
  const rest = await db.select({ anzahl: count() }).from(track);
  assertEquals(rest[0].anzahl, 1);
});

Deno.test("HUE-Query 1: Aeltestes Album liefert kleinstes Erscheinungsjahr", async () => {
  const db = testDb();
  const a = await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 }).returning();
  await db.insert(album).values({ titel: "Night Ferry", jahr: 2012, artistId: a[0].id });
  await db.insert(album).values({ titel: "Silent Lines", jahr: 2015, artistId: a[0].id });
  await db.insert(album).values({ titel: "Future Path", jahr: 2024, artistId: a[0].id });

  const aeltestes = await db.select().from(album).orderBy(asc(album.jahr)).limit(1);
  assertEquals(aeltestes.length, 1);
  assertEquals(aeltestes[0].titel, "Night Ferry");
  assertEquals(aeltestes[0].jahr, 2012);
});

Deno.test("HUE-Query 2: Tracks eines Albums mit Titel-Anfang 'Echo' (and + eq + like)", async () => {
  const db = testDb();
  const a = await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 }).returning();
  const al = await db.insert(album).values({ titel: "Silent Lines", jahr: 2015, artistId: a[0].id }).returning();
  await db.insert(track).values({ titel: "Silent Lines", dauerSek: 215, albumId: al[0].id });
  await db.insert(track).values({ titel: "Echo Room", dauerSek: 187, albumId: al[0].id });
  await db.insert(track).values({ titel: "Echo Waves", dauerSek: 242, albumId: al[0].id });
  await db.insert(track).values({ titel: "Night Echo", dauerSek: 190, albumId: al[0].id }); // endet nur auf Echo

  const treffer = await db.select().from(track)
    .where(and(eq(track.albumId, al[0].id), like(track.titel, "Echo%")));
  assertEquals(treffer.length, 2);
  const titel = treffer.map((t) => t.titel).sort();
  assertEquals(titel, ["Echo Room", "Echo Waves"]);
});

Deno.test("HUE-Query 3: Anzahl Tracks je Album mit count() und groupBy()", async () => {
  const db = testDb();
  const a = await db.insert(artist).values({ name: "Aera", gruendungsjahr: 1999 }).returning();
  const al1 = await db.insert(album).values({ titel: "Silent Lines", jahr: 2015, artistId: a[0].id }).returning();
  const al2 = await db.insert(album).values({ titel: "Night Ferry", jahr: 2012, artistId: a[0].id }).returning();

  await db.insert(track).values({ titel: "T1", dauerSek: 200, albumId: al1[0].id });
  await db.insert(track).values({ titel: "T2", dauerSek: 210, albumId: al1[0].id });
  await db.insert(track).values({ titel: "T3", dauerSek: 220, albumId: al2[0].id });

  const gruppen = await db.select({
    titel: album.titel,
    tracks: count(),
  })
    .from(track)
    .innerJoin(album, eq(track.albumId, album.id))
    .groupBy(album.id)
    .orderBy(asc(album.titel));

  assertEquals(gruppen.length, 2);
  assertEquals(gruppen, [
    { titel: "Night Ferry", tracks: 1 },
    { titel: "Silent Lines", tracks: 2 },
  ]);
});

Deno.test("Parametrisierung: Werte stehen in params, niemals im Plain-SQL", () => {
  const db = testDb();
  const query = db.select().from(album).where(eq(album.jahr, 2015));
  const { sql, params } = query.toSQL();
  assertEquals(sql.includes("2015"), false);
  assertEquals(params, [2015]);
});
