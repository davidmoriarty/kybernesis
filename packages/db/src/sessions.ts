// packages/db/src/sessions.ts
import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { index, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { SessionRow } from "./types";
import { users } from "./users";
import { workspaceMembers } from "./workspaceMembers";
import { workspaces } from "./workspaces";
import { tenants } from "./tenants";

// Narrow Drizzle transaction type (enough for what we use here)
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Sessions table
export const sessions = pgTable(
  "sessions",
  {
    // cookie token value
    id: uuid("id").defaultRandom().primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

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
    index("sessions_tenant_id_idx").on(t.tenantId),
    index("sessions_user_id_idx").on(t.userId),
    index("sessions_expires_at_idx").on(t.expiresAt),
  ],
);

export async function createSession(input: {
  tenantId: string;
  userId: string;
  workspaceId: string | null;
  expiresAt: Date;
}): Promise<SessionRow> {
  const inserted = (
    await db
      .insert(sessions)
      .values({
        tenantId: input.tenantId,
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
    tenantId: string;
    userId: string;
    workspaceId: string | null;
    expiresAt: Date;
  },
): Promise<SessionRow> {
  const inserted = (
    await tx
      .insert(sessions)
      .values({
        tenantId: input.tenantId,
        userId: input.userId,
        workspaceId: input.workspaceId,
        expiresAt: input.expiresAt,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create session");
  return inserted;
}

export async function getActiveSessionById(input: {
  tenantId: string;
  sessionId: string;
}): Promise<SessionRow | undefined> {
  const now = new Date();

  return (
    await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.tenantId, input.tenantId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
        ),
      )
      .limit(1)
  )[0];
}

export async function setSessionWorkspaceForUser(input: {
  tenantId: string;
  sessionId: string;
  userId: string;
  workspaceId: string;
}): Promise<boolean> {
  const now = new Date();

  // Load active session (also gives us tenantId for scoping)
  const session = (
    await db
      .select({ id: sessions.id, tenantId: sessions.tenantId })
      .from(sessions)
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.tenantId, input.tenantId),
          eq(sessions.userId, input.userId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
        ),
      )
      .limit(1)
  )[0];
  if (!session) return false;

  // Ensure workspace belongs to the same tenant as the session
  const workspace = (
    await db
      .select({ id: workspaces.id })
      .from(workspaces)
      .where(
        and(
          eq(workspaces.id, input.workspaceId),
          eq(workspaces.tenantId, session.tenantId),
        ),
      )
      .limit(1)
  )[0];
  if (!workspace) return false;

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
        lastSeenAt: now,
      })
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.tenantId, input.tenantId),
          eq(sessions.userId, input.userId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
        ),
      )
      .returning({ id: sessions.id })
  )[0];

  return Boolean(updated);
}

export async function revokeSession(input: {
  tenantId: string;
  sessionId: string;
}): Promise<boolean> {
  const now = new Date();

  const row = (
    await db
      .update(sessions)
      .set({ revokedAt: now })
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.tenantId, input.tenantId),
        ),
      )
      .returning({ id: sessions.id })
  )[0];

  return Boolean(row);
}

export async function touchSession(input: {
  tenantId: string;
  sessionId: string;
}): Promise<void> {
  const now = new Date();

  await db
    .update(sessions)
    .set({ lastSeenAt: now })
    .where(
      and(
        eq(sessions.id, input.sessionId),
        eq(sessions.tenantId, input.tenantId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, now),
      ),
    );
}

export async function clearSessionWorkspace(input: {
  tenantId: string;
  sessionId: string;
}): Promise<void> {
  await db
    .update(sessions)
    .set({ workspaceId: null, lastSeenAt: new Date() })
    .where(
      and(
        eq(sessions.id, input.sessionId),
        eq(sessions.tenantId, input.tenantId),
        isNull(sessions.revokedAt),
        gt(sessions.expiresAt, new Date()),
      ),
    );
}

export async function touchAndExtendSessionIfStale(
  input: { tenantId: string; sessionId: string },
  opts: { ttlMs: number; touchEveryMs: number },
): Promise<{ id: string; expiresAt: Date; lastSeenAt: Date } | undefined> {
  const now = new Date();
  const touchCutoff = new Date(Date.now() - opts.touchEveryMs);
  const newExpiresAt = new Date(Date.now() + opts.ttlMs);

  const updated = (
    await db
      .update(sessions)
      .set({
        lastSeenAt: now,
        expiresAt: newExpiresAt,
      })
      .where(
        and(
          eq(sessions.id, input.sessionId),
          eq(sessions.tenantId, input.tenantId),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, now),
          lt(sessions.lastSeenAt, touchCutoff),
        ),
      )
      .returning({
        id: sessions.id,
        expiresAt: sessions.expiresAt,
        lastSeenAt: sessions.lastSeenAt,
      })
  )[0];

  return updated;
}
