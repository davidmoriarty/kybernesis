// packages/db/src/tasks.ts
import {
  alias,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { eq, relations, sql, type SQL } from "drizzle-orm";
import { db } from "./dbInstance";
import { events } from "./events";
import { projects } from "./projects";
import { users } from "./users";

const assignedUser = alias(users, "assigned_user");
const createdByUser = alias(users, "created_by_user");

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "restrict",
      }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => sql`now()`),
  },
  (t) => [
    index("tasks_project_id_idx").on(t.projectId),
    index("tasks_status_idx").on(t.status),
    index("tasks_assigned_to_user_id_idx").on(t.assignedToUserId),
    index("tasks_created_by_user_id_idx").on(t.createdByUserId),
    index("tasks_project_status_idx").on(t.projectId, t.status),
    index("tasks_created_at_idx").on(t.createdAt),
  ],
);

export const taskRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedToUser: one(users, {
    fields: [tasks.assignedToUserId],
    references: [users.id],
    relationName: "assigned_tasks",
  }),
  createdByUser: one(users, {
    fields: [tasks.createdByUserId],
    references: [users.id],
    relationName: "created_tasks",
  }),
}));

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export async function createTask(input: {
  projectId: string;
  title: string;
  description?: string | null;
  assignedToUserId?: string | null;
  createdByUserId: string;
}) {
  const inserted = await db
    .insert(tasks)
    .values({
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      assignedToUserId: input.assignedToUserId ?? null,
      createdByUserId: input.createdByUserId,
    })
    .returning();

  const task = inserted[0];
  if (!task) {
    throw new Error("Failed to create task");
  }

  const project = await db
    .select({
      workspaceId: projects.workspaceId,
    })
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1);

  const workspaceId = project[0]?.workspaceId;

  if (workspaceId) {
    await db.insert(events).values({
      workspace_id: workspaceId,
      actor_id: input.createdByUserId,
      entityType: "task",
      entityId: task.id,
      eventType: "task.created",
      payload: {
        projectId: task.projectId,
        title: task.title,
        assignedToUserId: task.assignedToUserId,
        status: task.status,
      },
    });
  }

  return task;
}

export async function getTaskById(taskId: string) {
  const rows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      assignedToUserId: tasks.assignedToUserId,
      createdByUserId: tasks.createdByUserId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,

      assignedToUser: sql<{
        id: string;
        name: string | null;
        email: string;
      } | null>`case
          when ${assignedUser.id} is null then null
          else json_build_object(
            'id', ${assignedUser.id},
            'name', ${assignedUser.name},
            'email', ${assignedUser.email}
          )
        end`.as("assignedToUser"),

      createdByUser: sql<{
        id: string;
        name: string | null;
        email: string;
      }>`json_build_object(
          'id', ${createdByUser.id},
          'name', ${createdByUser.name},
          'email', ${createdByUser.email}
        )`.as("createdByUser"),
    })
    .from(tasks)
    .innerJoin(createdByUser, eq(createdByUser.id, tasks.createdByUserId))
    .leftJoin(assignedUser, eq(assignedUser.id, tasks.assignedToUserId))
    .where(eq(tasks.id, taskId))
    .limit(1);

  return rows[0] ?? null;
}

export async function listTasksForProject(projectId: string) {
  const rows = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      assignedToUserId: tasks.assignedToUserId,
      createdByUserId: tasks.createdByUserId,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,

      assignedToUser: sql<{
        id: string;
        name: string | null;
        email: string;
      } | null>`case
        when ${assignedUser.id} is null then null
        else json_build_object(
          'id', ${assignedUser.id},
          'name', ${assignedUser.name},
          'email', ${assignedUser.email}
        )
      end`.as("assignedToUser"),

      createdByUser: sql<{
        id: string;
        name: string | null;
        email: string;
      }>`json_build_object(
        'id', ${createdByUser.id},
        'name', ${createdByUser.name},
        'email', ${createdByUser.email}
      )`.as("createdByUser"),
    })
    .from(tasks)
    .innerJoin(createdByUser, eq(createdByUser.id, tasks.createdByUserId))
    .leftJoin(assignedUser, eq(assignedUser.id, tasks.assignedToUserId))
    .where(eq(tasks.projectId, projectId))
    .orderBy(tasks.createdAt);

  return rows;
}

export async function updateTaskStatus(input: {
  taskId: string;
  status: TaskStatus;
}) {
  const updated = await db
    .update(tasks)
    .set({
      status: input.status,
      updatedAt: sql`now()`,
    })
    .where(eq(tasks.id, input.taskId))
    .returning();

  return updated[0] ?? null;
}

export async function getTaskScope(taskId: string) {
  const rows = await db
    .select({
      taskId: tasks.id,
      projectId: tasks.projectId,
      workspaceId: projects.workspaceId,
    })
    .from(tasks)
    .innerJoin(projects, eq(projects.id, tasks.projectId))
    .where(eq(tasks.id, taskId))
    .limit(1);

  return rows[0] ?? null;
}

export async function updateTask(input: {
  taskId: string;
  title?: string;
  description?: string | null;
  assignedToUserId?: string | null;
}) {
  const updates: Partial<{
    title: string;
    description: string | null;
    assignedToUserId: string | null;
    updatedAt: SQL;
  }> = {
    updatedAt: sql`now()`,
  };

  if (input.title !== undefined) {
    updates.title = input.title;
  }

  if (input.description !== undefined) {
    updates.description = input.description;
  }

  if (input.assignedToUserId !== undefined) {
    updates.assignedToUserId = input.assignedToUserId;
  }

  const updated = await db
    .update(tasks)
    .set(updates)
    .where(eq(tasks.id, input.taskId))
    .returning();

  return updated[0] ?? null;
}

export async function deleteTask(taskId: string) {
  const deleted = await db
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning();

  return deleted[0] ?? null;
}
