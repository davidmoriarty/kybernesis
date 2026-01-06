// packages/db/src/dbInstance.ts
import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

// DB connection
const dbPath = new URL("../../../../kybernesis.db", import.meta.url).pathname;

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite);
