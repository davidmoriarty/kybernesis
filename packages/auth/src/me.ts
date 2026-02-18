import { type Contracts, UserMappers, Users } from "@db";
import type {} from "@shared/hono";
import type { Context } from "hono";

const { mapUserRowToUser } = UserMappers;

export async function meHandler(ctx: Context): Promise<Response> {
  if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);

  const userRow = await Users.getUserById(ctx.user.id);
  if (!userRow) return ctx.json({ error: "User not found" }, 404);

  return ctx.json(
    { user: mapUserRowToUser(userRow), workspace: ctx.workspace },
    200,
  );
}

export async function updateProfileHandler(ctx: Context): Promise<Response> {
  if (!ctx.user) return ctx.json({ error: "Unauthorized" }, 401);

  const { name, email, nickname, timezone, location, avatar } =
    (await ctx.req.json()) as Contracts.UpdateUserProfileInput;

  const updatedRow = await Users.updateUserProfile(ctx.user.id, {
    name,
    email,
    nickname: nickname ?? undefined,
    timezone: timezone ?? undefined,
    location: location ?? undefined,
    avatar: avatar ?? undefined,
  });

  if (!updatedRow) return ctx.json({ error: "Failed to update profile" }, 500);

  return ctx.json(
    {
      message: "Profile updated successfully",
      success: true,
      user: mapUserRowToUser(updatedRow),
    },
    200,
  );
}
