// packages/db/src/dbInstance.ts
import Database from "bun:sqlite";
import fs from "node:fs";
import { drizzle } from "drizzle-orm/bun-sqlite";

// DB connection
const dbPath = new URL("../../../kybernesis.db", import.meta.url).pathname;

console.log("DB PATH USED BY SERVER:", dbPath);
console.log("DB EXISTS:", fs.existsSync(dbPath));

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite);
