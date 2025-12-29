// packages/db/src/users.ts
import { eq } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "./index";

// Table definition (source of truth)
export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	email: text("email").notNull(),
	passwordHash: text("password_hash").notNull(),
});

// User domain type (derived from DB reality)
export type User = {
	id: number;
	email: string;
	passwordHash: string;
};

// Queries (sync on Bun SQLite)
export function getUserById(id: number) {
	return db.select().from(users).where(eq(users.id, id)).get();
}

export function getUserByEmail(email: string) {
	return db.select().from(users).where(eq(users.email, email)).get();
}
