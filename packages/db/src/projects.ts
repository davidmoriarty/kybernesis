// packages/db/src/projects.ts
import { and, eq, desc, sql, inArray } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { mapProjectRowToProject } from "./mappers";
import { events } from "./events";
import { workspaces } from "./workspaces";
import type { ProjectStatus, Project } from "@shared";

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
    status: text("status")
      .$type<ProjectStatus>()
      .notNull()
      .default("development"),
    notificationsEnabled: boolean("notifications_enabled")
      .default(false)
      .notNull(),
    isPublic: boolean("is_public").default(false).notNull(),
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
  actorId: string;
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

  await db.insert(events).values({
    workspace_id: input.workspaceId,
    actor_id: input.actorId,
    entityType: "project",
    entityId: inserted.id,
    eventType: "project.created",
    payload: {
      name: inserted.name,
    },
  });

  return mapProjectRowToProject(inserted);
}

export async function updateProjectForWorkspace(
  projectId: string,
  workspaceId: string,
  actorId: string,
  input: {
    name?: string;
    description?: string | null;
    status?: "development" | "live";
    notificationsEnabled?: boolean;
    isPublic?: boolean;
  },
): Promise<Project | undefined> {
  const set: Partial<{
    name: string;
    description: string | null;
    notificationsEnabled: boolean;
    status: "development" | "live";
    isPublic: boolean;
    updatedAt: Date;
  }> = { updatedAt: new Date() };

  if (input.name !== undefined) set.name = input.name;
  if (input.description !== undefined) set.description = input.description;
  if (input.status !== undefined) set.status = input.status;
  if (input.notificationsEnabled !== undefined) {
    set.notificationsEnabled = input.notificationsEnabled;
  }
  if (input.isPublic !== undefined) {
    set.isPublic = input.isPublic;
  }

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

  if (!updated) return undefined;

  await db.insert(events).values({
    workspace_id: workspaceId,
    actor_id: actorId,
    entityType: "project",
    entityId: projectId,
    eventType: "project.updated",
    payload: {
      name: updated.name,
      status: updated.status,
    },
  });

  return mapProjectRowToProject(updated);
}

export async function deleteProjectForWorkspace(
  projectId: string,
  workspaceId: string,
  actorId: string,
): Promise<boolean> {
  const deleted = (
    await db
      .delete(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      )
      .returning({ id: projects.id, name: projects.name })
  )[0];

  if (!deleted) return false;

  await db.insert(events).values({
    workspace_id: workspaceId,
    actor_id: actorId,
    entityType: "project",
    entityId: deleted.id,
    eventType: "project.deleted",
    payload: {
      name: deleted.name,
    },
  });

  return true;
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
): Promise<Pick<Project, "id" | "name" | "status" | "updatedAt">[]> {
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
      status: p.status,
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
