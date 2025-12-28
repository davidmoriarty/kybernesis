// packages/db/src/index.ts
import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const sqlite = new Database("kybernesis.db");
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
