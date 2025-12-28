import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
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
