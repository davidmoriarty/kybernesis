// packages/db/src/projects.ts
import { and, eq, desc, sql, inArray } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { mapProjectRowToProject } from "./mappers";
import { workspaces } from "./workspaces";
import type { Project } from "@shared";

// Table definition (source of truth)
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("projects_workspace_id_idx").on(t.workspaceId),
    index("projects_workspace_created_at_idx").on(t.workspaceId, t.createdAt),
  ],
);

// DB queries (async)

export async function createProject(input: {
  workspaceId: string;
  name: string;
  description: string | null;
}): Promise<Project> {
  const inserted = (
    await db
      .insert(projects)
      .values({
        workspaceId: input.workspaceId,
        name: input.name,
        description: input.description,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create project");
  return mapProjectRowToProject(inserted);
}

export async function updateProjectForWorkspace(
  projectId: string,
  workspaceId: string,
  input: { name?: string; description?: string | null },
): Promise<Project | undefined> {
  const set: Partial<{
    name: string;
    description: string | null;
    updatedAt: Date;
  }> = { updatedAt: new Date() };

  if (input.name !== undefined) set.name = input.name;
  if (input.description !== undefined) set.description = input.description;

  // If nothing besides updatedAt is being changed, you can decide to still touch updatedAt.
  const updated = (
    await db
      .update(projects)
      .set(set)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      )
      .returning()
  )[0];

  return updated ? mapProjectRowToProject(updated) : undefined;
}

export async function deleteProjectForWorkspace(
  projectId: string,
  workspaceId: string,
): Promise<boolean> {
  const deleted = (
    await db
      .delete(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      )
      .returning({ id: projects.id })
  )[0];

  return Boolean(deleted);
}

export async function getProjectsForTenantWorkspace(input: {
  tenantId: string;
  workspaceId: string;
}): Promise<Project[]> {
  const rows = await db
    .select({ p: projects })
    .from(projects)
    .innerJoin(workspaces, eq(projects.workspaceId, workspaces.id))
    .where(
      and(
        eq(projects.workspaceId, input.workspaceId),
        eq(workspaces.tenantId, input.tenantId),
      ),
    );

  return rows.map((r) => mapProjectRowToProject(r.p));
}

export async function getProjectByIdForTenantWorkspace(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
}): Promise<Project | undefined> {
  const row = (
    await db
      .select({ p: projects })
      .from(projects)
      .innerJoin(workspaces, eq(projects.workspaceId, workspaces.id))
      .where(
        and(
          eq(projects.id, input.projectId),
          eq(projects.workspaceId, input.workspaceId),
          eq(workspaces.tenantId, input.tenantId),
        ),
      )
      .limit(1)
  )[0];

  return row ? mapProjectRowToProject(row.p) : undefined;
}

export async function getProjectCountForTenantWorkspace(input: {
  tenantId: string;
  workspaceId: string;
}): Promise<number> {
  const row = (
    await db
      .select({ count: sql<number>`count(*)` })
      .from(projects)
      .innerJoin(workspaces, eq(projects.workspaceId, workspaces.id))
      .where(
        and(
          eq(projects.workspaceId, input.workspaceId),
          eq(workspaces.tenantId, input.tenantId),
        ),
      )
      .limit(1)
  )[0];

  return Number(row?.count ?? 0);
}

export async function getRecentProjectsForTenantWorkspace(
  tenantId: string,
  workspaceId: string,
  limit = 5,
): Promise<Pick<Project, "id" | "name" | "updatedAt">[]> {
  const rows = await db
    .select({ p: projects })
    .from(projects)
    .innerJoin(workspaces, eq(projects.workspaceId, workspaces.id))
    .where(
      and(
        eq(projects.workspaceId, workspaceId),
        eq(workspaces.tenantId, tenantId),
      ),
    )
    .orderBy(desc(projects.updatedAt))
    .limit(limit);

  return rows.map((r) => {
    const p = mapProjectRowToProject(r.p);
    return {
      id: p.id,
      name: p.name,
      updatedAt: p.updatedAt,
    };
  });
}

export async function getProjectsByIdsForTenantWorkspace(input: {
  tenantId: string;
  workspaceId: string;
  projectIds: string[];
}): Promise<Project[]> {
  if (input.projectIds.length === 0) return [];

  const rows = await db
    .select({ p: projects })
    .from(projects)
    .innerJoin(workspaces, eq(projects.workspaceId, workspaces.id))
    .where(
      and(
        eq(projects.workspaceId, input.workspaceId),
        eq(workspaces.tenantId, input.tenantId),
        inArray(projects.id, input.projectIds),
      ),
    );

  return rows.map((r) => mapProjectRowToProject(r.p));
}
