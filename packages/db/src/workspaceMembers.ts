// packages/db/src/workspaceMembers.ts
import { and, eq, sql } from "drizzle-orm";
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

export async function getMembersForWorkspace(workspaceId: string): Promise<
  {
    userId: string;
    role: WorkspaceMemberRow["role"];
    name: string;
    email: string;
    lastSeenAt: Date | null;
  }[]
> {
  return await db
    .select({
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      name: users.name,
      email: users.email,
      lastSeenAt: users.lastSeenAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .where(eq(workspaceMembers.workspaceId, workspaceId));
}

// --- Tenant-scoped variants (use these going forward) ---

export async function createWorkspaceMembershipForTenant(input: {
  tenantId: string;
  userId: string;
  workspaceId: string;
  role: WorkspaceMemberRow["role"];
}): Promise<WorkspaceMemberRow> {
  // Ensure user + workspace are in same tenant
  const ok = (
    await db
      .select({ ok: sql`1` })
      .from(users)
      .innerJoin(workspaces, eq(workspaces.id, input.workspaceId))
      .where(
        and(
          eq(users.id, input.userId),
          eq(workspaces.tenantId, input.tenantId),
        ),
      )
      .limit(1)
  )[0];

  if (!ok) throw new Error("Tenant mismatch (user/workspace)");

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

export async function getWorkspaceMembershipForTenant(input: {
  tenantId: string;
  userId: string;
  workspaceId: string;
}): Promise<WorkspaceMemberRow | undefined> {
  return (
    await db
      .select({ wm: workspaceMembers })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(
        and(
          eq(workspaces.tenantId, input.tenantId),
          eq(workspaceMembers.userId, input.userId),
          eq(workspaceMembers.workspaceId, input.workspaceId),
        ),
      )
      .limit(1)
  )[0]?.wm;
}

export async function getMembersForWorkspaceForTenant(input: {
  tenantId: string;
  workspaceId: string;
}): Promise<
  {
    userId: string;
    role: WorkspaceMemberRow["role"];
    name: string;
    email: string;
    lastSeenAt: Date | null;
  }[]
> {
  return db
    .select({
      userId: workspaceMembers.userId,
      role: workspaceMembers.role,
      name: users.name,
      email: users.email,
      lastSeenAt: users.lastSeenAt,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(users.id, workspaceMembers.userId))
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(
      and(
        eq(workspaces.tenantId, input.tenantId),
        eq(workspaceMembers.workspaceId, input.workspaceId),
      ),
    );
}
