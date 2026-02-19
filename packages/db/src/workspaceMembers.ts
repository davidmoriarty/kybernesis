// packages/db/src/workspaceMembers.ts
import { and, eq } from "drizzle-orm";
import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { WorkspaceMemberRow } from "./types";
import { users } from "./users";
import { workspaces } from "./workspaces";

// Workspace Members Table
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    role: text("role").$type<"admin" | "member">().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.workspaceId] }),
    index("workspace_members_workspace_id_idx").on(t.workspaceId),
    index("workspace_members_user_id_idx").on(t.userId),
  ],
);

export async function createWorkspaceMembership(input: {
  userId: string;
  workspaceId: string;
  role: WorkspaceMemberRow["role"];
}): Promise<WorkspaceMemberRow> {
  const inserted = (
    await db
      .insert(workspaceMembers)
      .values({
        userId: input.userId,
        workspaceId: input.workspaceId,
        role: input.role,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create workspace membership");
  return inserted;
}

export async function getWorkspaceMembership(
  userId: string,
  workspaceId: string,
): Promise<WorkspaceMemberRow | undefined> {
  return (
    await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .limit(1)
  )[0];
}
