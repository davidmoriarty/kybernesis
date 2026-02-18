// packages/db/src/sessions.ts
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { SessionRow } from "./types";
import { users } from "./users";
import { workspaceMembers } from "./workspaceMembers";
import { workspaces } from "./workspaces";

// Narrow Drizzle transaction type (enough for what we use here)
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Sessions table
export const sessions = pgTable(
  "sessions",
  {
    // cookie token value
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // “active workspace” selection (optional)
    workspaceId: uuid("workspace_id").references(() => workspaces.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ],
);

export async function createSession(input: {
  userId: string;
  workspaceId: string | null;
  expiresAt: Date;
}): Promise<SessionRow> {
  const inserted = (
    await db
      .insert(sessions)
      .values({
        userId: input.userId,
        workspaceId: input.workspaceId,
        expiresAt: input.expiresAt,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create session");
  return inserted;
}

export async function createSessionTx(
  tx: Tx,
  input: {
    userId: string;
    workspaceId: string | null;
    expiresAt: Date;
  },
): Promise<SessionRow> {
  const inserted = (
    await tx
      .insert(sessions)
      .values({
        userId: input.userId,
        workspaceId: input.workspaceId,
        expiresAt: input.expiresAt,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create session");
  return inserted;
}

export async function getActiveSessionById(
  sessionId: string,
): Promise<SessionRow | undefined> {
  return (
    await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1)
  )[0];
}

export async function setSessionWorkspaceForUser(input: {
  sessionId: string;
  userId: string;
  workspaceId: string;
}): Promise<boolean> {
  // Ensure the user is a member of the workspace they’re selecting
  const membership = (
    await db
      .select({ ok: sql`1` })
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.userId, input.userId),
          eq(workspaceMembers.workspaceId, input.workspaceId),
        ),
      )
      .limit(1)
  )[0];

  if (!membership) return false;

  // Only allow updating an active (not revoked, not expired) session
  const updated = (
    await db
      .update(sessions)
      .set({
        workspaceId: input.workspaceId,
        lastSeenAt: new Date(),
      })
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.userId, input.userId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .returning({ id: sessions.id })
  )[0];

  return Boolean(updated);
}

export async function revokeSession(sessionId: string): Promise<boolean> {
  const row = (
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId))
      .returning({ id: sessions.id })
  )[0];

  return Boolean(row);
}

export async function touchSession(sessionId: string): Promise<void> {
  await db
    .update(sessions)
    .set({ lastSeenAt: new Date() })
    .where(eq(sessions.id, sessionId));
}
