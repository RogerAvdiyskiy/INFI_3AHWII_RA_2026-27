// db.ts - SQLite-Verbindung und DDL-Tabellenanlage.
// Stack: Deno Runtime + natives node:sqlite + drizzle-orm 1.0.0-rc.4.
import { DatabaseSync } from "node:sqlite";
import { drizzle } from "drizzle-orm/node-sqlite";

// Polyfill fuer Denos node:sqlite StatementSync (setReturnArrays fehlt in Deno 2.x)
const _probe = new DatabaseSync(":memory:");
const _proto = Object.getPrototypeOf(_probe.prepare("SELECT 1"));
if (!_proto.setReturnArrays) {
  _proto.setReturnArrays = function(returnArrays: boolean) {
    this._returnArrays = returnArrays;
  };
  const origAll = _proto.all;
  _proto.all = function(...args: unknown[]) {
    const res = origAll.apply(this, args);
    if (this._returnArrays && Array.isArray(res)) {
      return res.map((row: unknown) =>
        row && typeof row === "object" && !Array.isArray(row)
          ? Object.values(row as Record<string, unknown>)
          : row
      );
    }
    return res;
  };
  const origGet = _proto.get;
  _proto.get = function(...args: unknown[]) {
    const res = origGet.apply(this, args);
    if (this._returnArrays && res && typeof res === "object" && !Array.isArray(res)) {
      return Object.values(res as Record<string, unknown>);
    }
    return res;
  };
}
_probe.close();

const DDL = [
  `CREATE TABLE IF NOT EXISTS artist (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     gruendungsjahr INTEGER)`,
  `CREATE TABLE IF NOT EXISTS album (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     titel TEXT NOT NULL,
     jahr INTEGER,
     artist_id INTEGER NOT NULL REFERENCES artist(id))`,
  `CREATE TABLE IF NOT EXISTS track (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     titel TEXT NOT NULL,
     dauer_sek INTEGER NOT NULL,
     album_id INTEGER NOT NULL REFERENCES album(id))`,
];

export function oeffneDb(pfad: string) {
  const client = new DatabaseSync(pfad);
  for (const anweisung of DDL) {
    client.exec(anweisung);
  }
  return drizzle({ client });
}
