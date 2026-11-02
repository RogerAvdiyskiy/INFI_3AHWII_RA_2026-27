// schema.ts - Tabellen der Musik-DB als TypeScript-Schema (Drizzle).
// sqliteTable erzeugt keine Tabellen in der Datenbank, sondern typisierte Schema-Objekte.
// Die Tabellen werden in db.ts per DDL initialisiert.
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const artist = sqliteTable("artist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  gruendungsjahr: integer("gruendungsjahr"),
});

export const album = sqliteTable("album", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titel: text("titel").notNull(),
  jahr: integer("jahr"),
  artistId: integer("artist_id").notNull().references(() => artist.id),
});

export const track = sqliteTable("track", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  titel: text("titel").notNull(),
  dauerSek: integer("dauer_sek").notNull(),
  albumId: integer("album_id").notNull().references(() => album.id),
});
