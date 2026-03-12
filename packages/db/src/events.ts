// packages/db/src/events.ts
import { desc, eq, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import { users } from "./users";
import { workspaces } from "./workspaces";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspace_id: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),

    actor_id: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),

    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),

    eventType: text("event_type").notNull(),

    payload: jsonb("payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("events_workspace_created_at_idx").on(
      table.workspace_id,
      table.created_at,
    ),
    index("events_actor_idx").on(table.actor_id),
    index("events_entity_idx").on(
      table.workspace_id,
      table.entityType,
      table.entityId,
    ),
    index("events_event_type_idx").on(table.workspace_id, table.eventType),
  ],
);

export const eventsRelations = relations(events, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [events.workspace_id],
    references: [workspaces.id],
  }),
  actor: one(users, {
    fields: [events.actor_id],
    references: [users.id],
  }),
}));

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export const eventEntityTypes = [
  "workspace",
  "member",
  "project",
  "task",
  "timeline",
  "notification",
] as const;

export type EventEntityType = (typeof eventEntityTypes)[number];

export const eventTypes = [
  "workspace.created",
  "workspace.updated",
  "member.added",
  "member.removed",
  "member.role_updated",
  "project.created",
  "project.updated",
  "project.archived",
  "task.created",
  "task.updated",
  "task.completed",
] as const;

export type EventType = (typeof eventTypes)[number];

export async function getWorkspaceEvents(workspaceId: string, limit = 20) {
  return db
    .select({
      id: events.id,
      workspace_id: events.workspace_id,
      actor_id: events.actor_id,
      actorName: users.name,
      entityType: events.entityType,
      entityId: events.entityId,
      eventType: events.eventType,
      payload: events.payload,
      created_at: events.created_at,
    })
    .from(events)
    .leftJoin(users, eq(users.id, events.actor_id))
    .where(eq(events.workspace_id, workspaceId))
    .orderBy(desc(events.created_at))
    .limit(limit);
}

type EmitEventInput = {
  workspaceId: string;
  actorId?: string | null;
  entityType: EventEntityType;
  entityId?: string | null;
  eventType: EventType;
  payload?: NewEvent["payload"];
};

export async function emitEvent({
  workspaceId,
  actorId,
  entityType,
  entityId,
  eventType,
  payload = {},
}: EmitEventInput) {
  try {
    await db.insert(events).values({
      workspace_id: workspaceId,
      actor_id: actorId ?? null,
      entityType,
      entityId: entityId ?? null,
      eventType,
      payload,
    });
  } catch (err) {
    console.error("event logging failed", {
      workspaceId,
      eventType,
      err,
    });
  }
}
