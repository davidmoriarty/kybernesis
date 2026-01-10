// packages/db/src/workspaceMembers.ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "./dbInstance";

// Workspace Members Table
export const workspaceMembers = sqliteTable("workspace_members", {
  userId: integer("user_id").notNull(),
  workspaceId: integer("workspace_id").notNull(),
  role: text("role").$type<"admin" | "member">().notNull(),
});

export function createWorkspaceMembersTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS workspace_members (
      user_id INTEGER NOT NULL,
      workspace_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
      PRIMARY KEY (user_id, workspace_id)
    );
  `);
}

export type WorkspaceMember = {
  id: number;
  userId: number;
  workspaceId: number;
  role: string;
};
