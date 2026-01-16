// packages/db/src/projects.ts
import { eq, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "./dbInstance";
import type { ProjectRow } from "./types";

// Table definition (source of truth)
export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workspaceId: integer("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export function createProjectsTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workspace_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);
}

// DB-only queries (return rows only)

export function getProjectById(id: number) {
  return db.select().from(projects).where(eq(projects.id, id)).get() as
    | ProjectRow
    | undefined;
}

export function getProjectsByWorkspace(workspaceId: number) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId))
    .all() as ProjectRow[];
}
