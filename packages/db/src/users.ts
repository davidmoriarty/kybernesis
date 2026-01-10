// packages/db/src/users.ts
import { eq } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "./dbInstance";

// Table definition (source of truth)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
});

export function createUsersTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );
  `);
}

// User domain type (derived from DB reality)
export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

// Queries (sync on Bun SQLite)

// GET User by Id
export function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get() as
    | User
    | undefined;
}

// GET User by Email
export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get() as
    | User
    | undefined;
}

// GET User by Name
export function getUserByName(name: string) {
  return db.select().from(users).where(eq(users.name, name)).get() as
    | User
    | undefined;
}
