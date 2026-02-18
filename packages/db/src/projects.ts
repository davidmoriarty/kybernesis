// packages/db/src/projects.ts
import { and, eq } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { ProjectRow } from "./types";
import { workspaces } from "./workspaces";

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
}): Promise<ProjectRow> {
  const inserted = (
    await db
      .insert(projects)
      .values({
        workspaceId: input.workspaceId,
        name: input.name,
        description: input.description,
        updatedAt: new Date(),
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create project");
  return inserted;
}

export async function updateProjectForWorkspace(
  projectId: string,
  workspaceId: string,
  input: { name?: string; description?: string | null },
): Promise<ProjectRow | undefined> {
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

  return updated;
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

export async function getProjectById(
  id: string,
): Promise<ProjectRow | undefined> {
  return (
    await db.select().from(projects).where(eq(projects.id, id)).limit(1)
  )[0];
}

export async function getProjectsByWorkspace(
  workspaceId: string,
): Promise<ProjectRow[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, workspaceId));

  return rows;
}

export async function getProjectByIdForWorkspace(
  projectId: string,
  workspaceId: string,
): Promise<ProjectRow | undefined> {
  return (
    await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.id, projectId), eq(projects.workspaceId, workspaceId)),
      )
      .limit(1)
  )[0];
}
