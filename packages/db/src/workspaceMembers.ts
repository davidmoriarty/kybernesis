// packages/db/src/workspaceMembers.ts
import { and, eq } from "drizzle-orm";
import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { WorkspaceMemberRow } from "./types";
import { users } from "./users";
import { workspaces } from "./workspaces";
import { tenantMembers } from "./tenantMembers";

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
    primaryKey({ columns: [t.workspaceId, t.userId] }),
    index("workspace_members_workspace_id_idx").on(t.workspaceId),
    index("workspace_members_user_id_idx").on(t.userId),
  ],
);

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
      .select({ workspaceId: workspaces.id })
      .from(workspaces)
      .innerJoin(
        tenantMembers,
        and(
          eq(tenantMembers.tenantId, workspaces.tenantId),
          eq(tenantMembers.userId, input.userId),
        ),
      )
      .where(
        and(
          eq(workspaces.id, input.workspaceId),
          eq(workspaces.tenantId, input.tenantId),
        ),
      )
      .limit(1)
  )[0];

  if (!ok)
    throw new Error(
      "Tenant mismatch (user not in tenant or workspace not in tenant)",
    );

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
    )
    .orderBy(users.name);
}

export async function getWorkspaceRoleForUser(input: {
  tenantId: string;
  userId: string;
  workspaceId: string;
}): Promise<WorkspaceMemberRow["role"] | null> {
  const membership = await getWorkspaceMembershipForTenant(input);
  return membership?.role ?? null;
}
