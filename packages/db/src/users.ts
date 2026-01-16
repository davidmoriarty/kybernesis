// packages/db/src/users.ts
import { eq, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "./dbInstance";
import type { UserRow } from "./types";

// Table definition (source of truth)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`    (strftime('%s', 'now'))`),
  nickname: text("nickname"),
  timezone: text("timezone"),
  location: text("location"),
  avatar: text("avatar"),
});

export function createUsersTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      nickname TEXT,
      timezone TEXT,
      location TEXT,
      avatar TEXT
    );
  `);
}

// Queries (sync on Bun SQLite)

// GET User by Id
export function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get() as
    | UserRow
    | undefined;
}

// GET User by Email
export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get() as
    | UserRow
    | undefined;
}

// GET User by Name
export function getUserByName(name: string) {
  return db.select().from(users).where(eq(users.name, name)).get() as
    | UserRow
    | undefined;
}
