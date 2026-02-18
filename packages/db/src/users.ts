// packages/db/src/users.ts
import { eq } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { UpdateUserProfileInput } from "./contracts";
import { db } from "./dbInstance";
import { sessions } from "./sessions";
import type { SessionRow, UserRow } from "./types";
import { workspaceMembers } from "./workspaceMembers";
import { workspaces } from "./workspaces";

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
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);

// Queries (async on Postgres)

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

export async function createUserWithWorkspaceAndSession(input: {
  name: string;
  email: string;
  passwordHash: string;
  sessionExpiresAt: Date;
}): Promise<{ session: SessionRow }> {
  return db.transaction(async (tx) => {
    const user = (
      await tx
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
        })
        .returning()
    )[0];

    if (!user) throw new Error("Failed to create user");

    const workspace = (
      await tx
        .insert(workspaces)
        .values({
          name: `${input.name}'s Workspace`,
          ownerId: user.id,
        })
        .returning()
    )[0];

    if (!workspace) throw new Error("Failed to create workspace");

    await tx.insert(workspaceMembers).values({
      userId: user.id,
      workspaceId: workspace.id,
      role: "admin",
    });

    const session = (
      await tx
        .insert(sessions)
        .values({
          userId: user.id,
          workspaceId: workspace.id,
          expiresAt: input.sessionExpiresAt,
        })
        .returning()
    )[0];

    if (!session) throw new Error("Failed to create session");

    return { session };
  });
}

export async function updateUserProfile(
  userId: string,
  input: UpdateUserProfileInput,
): Promise<UserRow | undefined> {
  const updateData: UserUpdateSet = { updatedAt: new Date() };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.email !== undefined) updateData.email = input.email;
  if (input.nickname !== undefined) updateData.nickname = input.nickname;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.avatar !== undefined) updateData.avatar = input.avatar;

  return (
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning()
  )[0];
}

// GET User by Id
export async function getUserById(id: string): Promise<UserRow | undefined> {
  return (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
}

// GET User by Email
export async function getUserByEmail(
  email: string,
): Promise<UserRow | undefined> {
  return (
    await db.select().from(users).where(eq(users.email, email)).limit(1)
  )[0];
}

// GET User by Name
export async function getUserByName(
  name: string,
): Promise<UserRow | undefined> {
  return (
    await db.select().from(users).where(eq(users.name, name)).limit(1)
  )[0];
}
