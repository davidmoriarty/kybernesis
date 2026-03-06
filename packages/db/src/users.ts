// packages/db/src/users.ts
import { and, eq, exists, isNull, lt, or, sql } from "drizzle-orm";
import {
  alias,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { UpdateUserProfileInput } from "shared";
import type { Tx, UserRow } from "./types";
import { tenantMembers } from "./tenantMembers";

type UserUpdateSet = UpdateUserProfileInput & { updatedAt: Date };

// Table definition (source of truth)
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    nickname: text("nickname"),
    timezone: text("timezone"),
    location: text("location"),
    avatar: text("avatar"),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

/**
 * Tenant scoping without users.tenantId:
 * Enforce "user belongs to tenant" via tenant_members existence.
 */
function whereUserInTenant(tenantId: string) {
  return sql`exists (
    select 1
    from ${tenantMembers} tm
    where tm.${tenantMembers.tenantId} = ${tenantId}
      and tm.${tenantMembers.userId} = ${users.id}
  )`;
}

// ----- Create user (non-tx) -----
// Note: creating a user no longer assigns them to a tenant.
// Do tenant assignment separately by inserting into tenant_members.
export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
  nickname?: string | null;
  timezone?: string | null;
  location?: string | null;
  avatar?: string | null;
}): Promise<UserRow> {
  const inserted = (
    await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        nickname: input.nickname ?? null,
        timezone: input.timezone ?? null,
        location: input.location ?? null,
        avatar: input.avatar ?? null,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create user");
  return inserted;
}

// ----- Create user (tx helper) -----

export async function createUserTx(
  tx: Tx,
  input: {
    name: string;
    email: string;
    passwordHash: string;
    nickname?: string | null;
    timezone?: string | null;
    location?: string | null;
    avatar?: string | null;
  },
): Promise<UserRow> {
  const inserted = (
    await tx
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        nickname: input.nickname ?? null,
        timezone: input.timezone ?? null,
        location: input.location ?? null,
        avatar: input.avatar ?? null,
      })
      .returning()
  )[0];

  if (!inserted) throw new Error("Failed to create user");
  return inserted;
}

// ----- Update profile -----
// Scoped to tenant via tenant_members.
export async function updateUserProfile(
  input: { tenantId: string; userId: string },
  profile: UpdateUserProfileInput,
): Promise<UserRow | undefined> {
  const tm = alias(tenantMembers, "tm");

  const updateData: UserUpdateSet = { updatedAt: new Date() };

  if (profile.name !== undefined) updateData.name = profile.name;
  if (profile.email !== undefined) updateData.email = profile.email;
  if (profile.nickname !== undefined) updateData.nickname = profile.nickname;
  if (profile.timezone !== undefined) updateData.timezone = profile.timezone;
  if (profile.location !== undefined) updateData.location = profile.location;
  if (profile.avatar !== undefined) updateData.avatar = profile.avatar;

  return (
    await db
      .update(users)
      .set(updateData)
      .where(
        and(
          eq(users.id, input.userId),
          exists(
            db
              .select({ ok: sql`1` })
              .from(tm)
              .where(
                and(eq(tm.tenantId, input.tenantId), eq(tm.userId, users.id)),
              ),
          ),
        ),
      )
      .returning()
  )[0];
}

// ----- Gets -----

export async function getUserById(input: {
  tenantId: string;
  userId: string;
}): Promise<UserRow | undefined> {
  const tm = alias(tenantMembers, "tm");

  return (
    await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, input.userId),
          exists(
            db
              .select({ ok: sql`1` })
              .from(tm)
              .where(
                and(eq(tm.tenantId, input.tenantId), eq(tm.userId, users.id)),
              ),
          ),
        ),
      )
      .limit(1)
  )[0];
}

/**
 * Global lookup (useful for login where email is unique globally).
 * If your auth flow is tenant-first, use getUserByEmailInTenant instead.
 */
export async function getUserByEmailGlobal(input: {
  email: string;
}): Promise<UserRow | undefined> {
  return (
    await db.select().from(users).where(eq(users.email, input.email)).limit(1)
  )[0];
}

export async function getUserByEmailInTenant(input: {
  tenantId: string;
  email: string;
}): Promise<UserRow | undefined> {
  const tm = alias(tenantMembers, "tm");

  return (
    await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, input.email),
          exists(
            db
              .select({ ok: sql`1` })
              .from(tm)
              .where(
                and(eq(tm.tenantId, input.tenantId), eq(tm.userId, users.id)),
              ),
          ),
        ),
      )
      .limit(1)
  )[0];
}

export async function getUserByNameInTenant(input: {
  tenantId: string;
  name: string;
}): Promise<UserRow | undefined> {
  return (
    await db
      .select()
      .from(users)
      .where(and(eq(users.name, input.name), whereUserInTenant(input.tenantId)))
      .limit(1)
  )[0];
}

export async function touchLastSeenIfStale(input: {
  tenantId: string;
  userId: string;
}): Promise<void> {
  const tm = alias(tenantMembers, "tm");
  const now = new Date();
  const cutoff = new Date(Date.now() - 30_000);

  await db
    .update(users)
    .set({ lastSeenAt: now })
    .where(
      and(
        eq(users.id, input.userId),
        exists(
          db
            .select({ ok: sql`1` })
            .from(tm)
            .where(
              and(eq(tm.tenantId, input.tenantId), eq(tm.userId, users.id)),
            ),
        ),
        or(isNull(users.lastSeenAt), lt(users.lastSeenAt, cutoff)),
      ),
    );
}
