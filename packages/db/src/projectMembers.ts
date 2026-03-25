// packages/db/src/projectMembers.ts
import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { and, eq } from "drizzle-orm";
import { db } from "@db";
import { events } from "./events";
import { projects } from "./projects";
import { users } from "./users";

// Project Members Table
export const projectMembers = pgTable(
  "project_members",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<"admin" | "member">().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.projectId, t.userId] }),
    index("project_members_project_id_idx").on(t.projectId),
    index("project_members_user_id_idx").on(t.userId),
  ],
);

export async function createProjectMembership(input: {
  projectId: string;
  userId: string;
  role: "admin" | "member";
}): Promise<void> {
  await db.insert(projectMembers).values({
    projectId: input.projectId,
    userId: input.userId,
    role: input.role,
  });
}

export async function getProjectMembership(input: {
  projectId: string;
  userId: string;
}) {
  return (
    await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, input.projectId),
          eq(projectMembers.userId, input.userId),
        ),
      )
      .limit(1)
  )[0];
}

export async function getMembersForProject(projectId: string) {
  return db
    .select({
      userId: projectMembers.userId,
      role: projectMembers.role,
      name: users.name,
      email: users.email,
    })
    .from(projectMembers)
    .innerJoin(users, eq(users.id, projectMembers.userId))
    .where(eq(projectMembers.projectId, projectId));
}

export async function getProjectWorkspaceId(args: {
  projectId: string;
}): Promise<string | null> {
  const row = (
    await db
      .select({ workspaceId: projects.workspaceId })
      .from(projects)
      .where(eq(projects.id, args.projectId))
      .limit(1)
  )[0];

  return row?.workspaceId ?? null;
}

export async function getProjectRoleForUser(args: {
  userId: string;
  projectId: string;
}): Promise<"admin" | "member" | null> {
  const row = (
    await db
      .select({ role: projectMembers.role })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, args.projectId),
          eq(projectMembers.userId, args.userId),
        ),
      )
      .limit(1)
  )[0];

  return row?.role ?? null;
}

export async function listProjectIdsForUserInWorkspace(args: {
  userId: string;
  workspaceId: string;
}): Promise<string[]> {
  const rows = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .innerJoin(projects, eq(projects.id, projectMembers.projectId))
    .where(
      and(
        eq(projectMembers.userId, args.userId),
        eq(projects.workspaceId, args.workspaceId),
      ),
    );

  return rows.map((r) => r.projectId);
}

export async function getProjectName(args: {
  projectId: string;
}): Promise<string | null> {
  const row = (
    await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, args.projectId))
      .limit(1)
  )[0];

  return row?.name ?? null;
}

export async function addProjectMember(args: {
  projectId: string;
  userId: string;
  role: "member" | "admin";
  actorId: string;
}): Promise<void> {
  await db
    .insert(projectMembers)
    .values({
      projectId: args.projectId,
      userId: args.userId,
      role: args.role,
    })
    .onConflictDoNothing();

  const workspaceId = await getProjectWorkspaceId({
    projectId: args.projectId,
  });
  if (!workspaceId) return;

  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, args.userId))
    .limit(1);
  const email = user[0]?.email ?? args.userId;

  const projectName = await getProjectName({
    projectId: args.projectId,
  });

  await db.insert(events).values({
    workspace_id: workspaceId,
    actor_id: args.actorId,
    entityType: "member",
    entityId: args.userId,
    eventType: "member.added",
    payload: {
      projectId: args.projectId,
      projectName,
      userId: args.userId,
      email,
      role: args.role,
    },
  });
}

export async function removeProjectMember(args: {
  projectId: string;
  userId: string;
  actorId: string;
}): Promise<void> {
  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, args.projectId),
        eq(projectMembers.userId, args.userId),
      ),
    );

  const workspaceId = await getProjectWorkspaceId({
    projectId: args.projectId,
  });
  if (!workspaceId) return;

  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, args.userId))
    .limit(1);
  const email = user[0]?.email ?? args.userId;

  const projectName = await getProjectName({
    projectId: args.projectId,
  });

  await db.insert(events).values({
    workspace_id: workspaceId,
    actor_id: args.actorId,
    entityType: "member",
    entityId: args.userId,
    eventType: "member.removed",
    payload: {
      projectId: args.projectId,
      projectName,
      userId: args.userId,
      email,
    },
  });
}

export async function setProjectMemberRole(args: {
  projectId: string;
  userId: string;
  role: "member";
  actorId: string;
}) {
  await db
    .update(projectMembers)
    .set({ role: args.role })
    .where(
      and(
        eq(projectMembers.projectId, args.projectId),
        eq(projectMembers.userId, args.userId),
      ),
    );

  const workspaceId = await getProjectWorkspaceId({
    projectId: args.projectId,
  });
  if (!workspaceId) return;

  const user = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, args.userId))
    .limit(1);
  const email = user[0]?.email ?? args.userId;

  const projectName = await getProjectName({
    projectId: args.projectId,
  });

  await db.insert(events).values({
    workspace_id: workspaceId,
    actor_id: args.actorId,
    entityType: "member",
    entityId: args.userId,
    eventType: "member.role_updated",
    payload: {
      projectId: args.projectId,
      projectName,
      userId: args.userId,
      role: args.role,
      email,
    },
  });
}
