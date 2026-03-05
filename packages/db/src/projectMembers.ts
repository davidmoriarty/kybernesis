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
