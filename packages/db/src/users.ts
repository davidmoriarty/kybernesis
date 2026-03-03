// packages/db/src/users.ts
import { eq, and, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { db } from "./dbInstance";
import type { UpdateUserProfileInput } from "./types/contracts";
import type { Tx, UserRow } from "./types";
import { tenants } from "./tenants";

type UserUpdateSet = UpdateUserProfileInput & { updatedAt: Date };

// Table definition (source of truth)
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),

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
  (t) => [
    uniqueIndex("users_tenant_id_email_unique").on(t.tenantId, t.email),
    index("users_tenant_id_idx").on(t.tenantId),
  ],
);

// ----- Create user (non-tx) -----

export async function createUser(input: {
  tenantId: string;
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
        tenantId: input.tenantId,
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
    tenantId: string;
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
        tenantId: input.tenantId,
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

export async function updateUserProfile(
  input: { tenantId: string; userId: string },
  profile: UpdateUserProfileInput,
): Promise<UserRow | undefined> {
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
        and(eq(users.tenantId, input.tenantId), eq(users.id, input.userId)),
      )
      .returning()
  )[0];
}

// ----- Gets -----

export async function getUserById(input: {
  tenantId: string;
  userId: string;
}): Promise<UserRow | undefined> {
  return (
    await db
      .select()
      .from(users)
      .where(
        and(eq(users.tenantId, input.tenantId), eq(users.id, input.userId)),
      )
      .limit(1)
  )[0];
}

export async function getUserByEmail(input: {
  tenantId: string;
  email: string;
}): Promise<UserRow | undefined> {
  return (
    await db
      .select()
      .from(users)
      .where(
        and(eq(users.tenantId, input.tenantId), eq(users.email, input.email)),
      )
      .limit(1)
  )[0];
}

export async function getUserByName(input: {
  tenantId: string;
  name: string;
}): Promise<UserRow | undefined> {
  return (
    await db
      .select()
      .from(users)
      .where(
        and(eq(users.tenantId, input.tenantId), eq(users.name, input.name)),
      )
      .limit(1)
  )[0];
}

export async function touchLastSeenIfStale(input: {
  tenantId: string;
  userId: string;
}): Promise<void> {
  await db
    .update(users)
    .set({ lastSeenAt: new Date() })
    .where(
      sql`${users.tenantId} = ${input.tenantId} AND ${users.id} = ${input.userId} AND (${users.lastSeenAt} IS NULL OR ${users.lastSeenAt} < now() - interval '30 seconds')`,
    );
}
