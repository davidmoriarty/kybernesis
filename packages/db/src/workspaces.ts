// packages/db/src/workspaces.ts
import type {
  WorkspaceRow,
  WorkspaceRowSummary,
  WorkspaceRowSummaryWithRole,
} from "./types";
import type { Workspace } from "shared";
import { and, asc, eq, sql } from "drizzle-orm";
import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { mapWorkspaceSummaryWithRoleToWorkspace } from "./mappers";
import { events } from "./events";
import { tenants } from "./tenants";
import { tenantMembers } from "./tenantMembers";
import { workspaceMembers } from "./workspaceMembers";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (t) => [
    index("workspaces_tenant_id_idx").on(t.tenantId),
    uniqueIndex("workspaces_tenant_id_name_unique").on(t.tenantId, t.name),
  ],
);

function whereUserInTenant(tenantId: string, userId: string) {
  return sql`exists (
    select 1
    from ${tenantMembers} tm
    where tm.${tenantMembers.tenantId} = ${tenantId}
      and tm.${tenantMembers.userId} = ${userId}
  )`;
}

/**
 * Create workspace (no ownerId column).
 * Ensure caller belongs to tenant; add them as workspace admin in same operation.
 * NOTE: This should ideally be transactional at the service layer if you also
 * need to create other rows.
 */
export async function createWorkspace(input: {
  tenantId: string;
  name: string;
  creatorUserId: string;
}): Promise<WorkspaceRow> {
  return await db.transaction(async (tx) => {
    // ensure creator is a tenant member
    const ok = (
      await tx
        .select({ ok: sql<number>`1` })
        .from(tenantMembers)
        .where(
          and(
            eq(tenantMembers.tenantId, input.tenantId),
            eq(tenantMembers.userId, input.creatorUserId),
          ),
        )
        .limit(1)
    )[0];

    if (!ok) throw new Error("User is not a member of tenant");

    const inserted = (
      await tx
        .insert(workspaces)
        .values({
          tenantId: input.tenantId,
          name: input.name,
        })
        .returning()
    )[0];

    if (!inserted) throw new Error("Failed to create workspace");

    await tx.insert(workspaceMembers).values({
      workspaceId: inserted.id,
      userId: input.creatorUserId,
      role: "admin",
    });

    await tx.insert(events).values({
      workspace_id: inserted.id,
      actor_id: input.creatorUserId,
      entityType: "workspace",
      entityId: inserted.id,
      eventType: "workspace.created",
      payload: {
        name: inserted.name,
      },
    });

    return inserted;
  });
}

export async function getWorkspaceByName(input: {
  tenantId: string;
  name: string;
}): Promise<WorkspaceRowSummary | undefined> {
  return (
    await db
      .select({
        id: workspaces.id,
        tenantId: workspaces.tenantId,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(
        and(
          eq(workspaces.tenantId, input.tenantId),
          eq(workspaces.name, input.name),
        ),
      )
      .limit(1)
  )[0];
}

export async function getWorkspaceById(input: {
  tenantId: string;
  workspaceId: string;
}): Promise<WorkspaceRowSummary | undefined> {
  return (
    await db
      .select({
        id: workspaces.id,
        tenantId: workspaces.tenantId,
        name: workspaces.name,
      })
      .from(workspaces)
      .where(
        and(
          eq(workspaces.tenantId, input.tenantId),
          eq(workspaces.id, input.workspaceId),
        ),
      )
      .limit(1)
  )[0];
}

export async function getWorkspacesForUser(input: {
  tenantId: string;
  userId: string;
}): Promise<Workspace[]> {
  const rows: WorkspaceRowSummaryWithRole[] = await db
    .select({
      id: workspaces.id,
      tenantId: workspaces.tenantId,
      name: workspaces.name,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(
      and(
        eq(workspaceMembers.userId, input.userId),
        eq(workspaces.tenantId, input.tenantId),
        whereUserInTenant(input.tenantId, input.userId),
      ),
    )
    .orderBy(asc(workspaces.name));

  return rows.map(mapWorkspaceSummaryWithRoleToWorkspace);
}

export async function getAnyWorkspaceIdForUser(input: {
  tenantId: string;
  userId: string;
}): Promise<string | null> {
  const member = (
    await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(
        and(
          eq(workspaceMembers.userId, input.userId),
          eq(workspaces.tenantId, input.tenantId),
        ),
      )
      .limit(1)
  )[0];

  return member?.workspaceId ?? null;
}

export async function getWorkspaceWithRoleForUser(input: {
  tenantId: string;
  userId: string;
  workspaceId: string;
}): Promise<Workspace | undefined> {
  const row = (
    await db
      .select({
        id: workspaces.id,
        tenantId: workspaces.tenantId,
        name: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(
        and(
          eq(workspaceMembers.userId, input.userId),
          eq(workspaceMembers.workspaceId, input.workspaceId),
          eq(workspaces.tenantId, input.tenantId),
        ),
      )
      .limit(1)
  )[0];

  return row ? mapWorkspaceSummaryWithRoleToWorkspace(row) : undefined;
}

// Returns the "Default Workspace" if present; otherwise first workspace for tenant.
export async function getDefaultWorkspaceIdForTenant(input: {
  tenantId: string;
}): Promise<string | null> {
  const byName = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(
        and(
          eq(workspaces.tenantId, input.tenantId),
          eq(workspaces.name, "Default Workspace"),
        ),
      )
      .limit(1)
  )[0];

  if (byName?.id) return byName.id;

  const anyWorkspace = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(eq(workspaces.tenantId, input.tenantId))
      .limit(1)
  )[0];

  return anyWorkspace?.id ?? null;
}
