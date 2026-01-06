// packages/db/src/sessions.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "./dbInstance";

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // session ID
  userId: integer("user_id").notNull(),
  workspaceId: integer("workspace_id"),
  expiresAt: integer("expires_at").notNull(),
});

export function createSessionsTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      workspace_id INTEGER,
      expires_at INTEGER NOT NULL
    );
  `);
}
