// packages/db/src/index.ts
import Database from "bun:sqlite";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// DB Path
const dbPath = join(
	new URL("../../../", import.meta.url).pathname,
	"kybernesis.db",
);
const sqlite = new Database(dbPath);

sqlite.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner_id INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    workspace_id INTEGER,
    expires_at INTEGER NOT NULL
  );
`);

export const db = drizzle(sqlite);

// Users table
export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	email: text("email").notNull(),
	passwordHash: text("password_hash").notNull(),
});

// Workspaces table
export const workspaces = sqliteTable("workspaces", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	ownerId: integer("owner_id").notNull(),
});

// Sessions table
export const sessions = sqliteTable("sessions", {
	id: text("id").primaryKey(), // session ID
	userId: integer("user_id").notNull(),
	workspaceId: integer("workspace_id"),
	expiresAt: integer("expires_at").notNull(),
});
