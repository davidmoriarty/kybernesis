// packages/db/src/workspaces.ts
import type { Workspace } from "@shared/types/auth";
import { and, asc, eq } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { mapWorkspaceSummaryWithRoleToWorkspace } from "./mappers/workspace";
import type {
  WorkspaceRow,
  WorkspaceSummary,
  WorkspaceSummaryWithRole,
} from "./types";
import { users } from "./users";
import { workspaceMembers } from "./workspaceMembers";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("workspaces_owner_id_idx").on(t.ownerId)],
);

export async function createWorkspace(input: {
  name: string;
  ownerId: string;
}): Promise<WorkspaceRow> {
  const inserted = (
    await db
      .insert(workspaces)
      .values({
        name: input.name,
        ownerId: input.ownerId,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create workspace");
  return inserted;
}

export async function getWorkspaceByName(
  name: string,
): Promise<WorkspaceSummary | undefined> {
  return (
    await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(eq(workspaces.name, name))
      .limit(1)
  )[0];
}

export async function getWorkspaceById(
  workspaceId: string,
): Promise<WorkspaceSummary | undefined> {
  return (
    await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1)
  )[0];
}

export async function getWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  const rows: WorkspaceSummaryWithRole[] = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaces.name));

  return rows.map(mapWorkspaceSummaryWithRoleToWorkspace);
}

export async function getAnyWorkspaceIdForUser(
  userId: string,
): Promise<string | null> {
  const owned = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.ownerId, userId))
      .limit(1)
  )[0];

  if (owned) return owned.id;

  const member = (
    await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .limit(1)
  )[0];

  return member?.workspaceId ?? null;
}

export async function getWorkspaceWithRoleForUser(
  userId: string,
  workspaceId: string,
): Promise<Workspace | undefined> {
  const row = (
    await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(
        and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .limit(1)
  )[0];

  return row ? mapWorkspaceSummaryWithRoleToWorkspace(row) : undefined;
}
