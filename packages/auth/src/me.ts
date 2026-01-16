// packages/auth/src/me.ts
import { db, UserMappers, Users } from "@db";
import type {} from "@shared/hono";
import { eq } from "drizzle-orm";
import type { Context } from "hono";

const { mapUserRowToUser } = UserMappers;

export async function meHandler(ctx: Context) {
  if (!ctx.user) {
    return ctx.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRow = Users.getUserById(ctx.user.id);
  if (!userRow) {
    return ctx.json({ error: "User not found" }, { status: 404 });
  }

  const user = mapUserRowToUser(userRow);

  return ctx.json({
    user,
    workspace: ctx.workspace,
  });
}

export async function updateProfileHandler(ctx: Context) {
  if (!ctx.user) {
    return ctx.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await ctx.req.json();
  const now = Math.floor(Date.now() / 1000);

  // Update user in DB and get returned row
  const updatedRow = db
    .update(Users.users)
    .set({
      name,
      email,
      updatedAt: now,
    })
    .where(eq(Users.users.id, ctx.user.id))
    .returning()
    .get();

  if (!updatedRow) {
    return ctx.json({ error: "Failed to update profile" }, { status: 500 });
  }

  const updatedUser = mapUserRowToUser(updatedRow);

  return ctx.json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
}
