// src/prisma.js — Ein PrismaClient für das gesamte Projekt.
// Prisma 7 verwendet standardmäßig Driver Adapters (better-sqlite3).
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url });

export const prisma = new PrismaClient({ adapter });

