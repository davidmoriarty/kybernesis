// packages/db/src/workspaces.ts
import type {
  WorkspaceRow,
  WorkspaceRowSummary,
  WorkspaceRowSummaryWithRole,
} from "./types";
import type { Workspace } from "@shared";
import { and, asc, eq } from "drizzle-orm";
import { index, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { mapWorkspaceSummaryWithRoleToWorkspace } from "./mappers";
import { tenants } from "./tenants";
import { users } from "./users";
import { workspaceMembers } from "./workspaceMembers";

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("workspaces_tenant_id_idx").on(t.tenantId),
    index("workspaces_owner_id_idx").on(t.ownerId),
    uniqueIndex("workspaces_tenant_id_name_unique").on(t.tenantId, t.name),
  ],
);

export async function createWorkspace(input: {
  tenantId: string;
  name: string;
  ownerId: string;
}): Promise<WorkspaceRow> {
  const inserted = (
    await db
      .insert(workspaces)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        ownerId: input.ownerId,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create workspace");
  return inserted;
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
      ),
    )
    .orderBy(asc(workspaces.name));

  return rows.map(mapWorkspaceSummaryWithRoleToWorkspace);
}

export async function getAnyWorkspaceIdForUser(input: {
  tenantId: string;
  userId: string;
}): Promise<string | null> {
  const owned = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(
        and(
          eq(workspaces.tenantId, input.tenantId),
          eq(workspaces.ownerId, input.userId),
        ),
      )
      .limit(1)
  )[0];

  if (owned) return owned.id;

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
