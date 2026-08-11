// packages/auth/src/me.ts

import { Users } from "db";
import { mapUserRowToUser } from "db/mappers";
import { isUpdateUserProfileInput } from "./validators/updateProfile";
import type { MeResponse, UpdateProfileResponse } from "shared";
import type {} from "shared/hono";
import type { Context } from "hono";

export async function meHandler(ctx: Context): Promise<Response> {
  const user = ctx.get("user");
  const tenantId = ctx.get("tenantId");
  const tenantSlug = ctx.get("tenantSlug");
  const tenantRole = ctx.get("tenantRole");

  if (!tenantId || !tenantRole || !user?.id) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }

  const userRow = await Users.getUserById({ tenantId, userId: user.id });
  if (!userRow) return ctx.json({ error: "User not found" }, 404);

  return ctx.json<MeResponse>(
    {
      tenant: { id: tenantId, slug: tenantSlug ?? null },
      tenantRole,
      user: mapUserRowToUser(userRow),
      workspace: ctx.get("workspace") ?? null,
    },
    200,
  );
}

export async function updateProfileHandler(ctx: Context): Promise<Response> {
  const user = ctx.get("user");
  const tenantId = ctx.get("tenantId");

  if (!tenantId || !user?.id) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }

  let body: unknown;

  try {
    body = await ctx.req.json();
  } catch {
    return ctx.json({ error: "Invalid JSON" }, 400);
  }

  if (!isUpdateUserProfileInput(body)) {
    return ctx.json({ error: "Invalid request body" }, 400);
  }

  const { name, email, nickname, timezone, location, avatar } = body;

  const updatedRow = await Users.updateUserProfile(
    { tenantId, userId: user.id },
    {
      name,
      email,
      nickname: nickname ?? undefined,
      timezone: timezone ?? undefined,
      location: location ?? undefined,
      avatar: avatar ?? undefined,
    },
  );

  if (!updatedRow) {
    return ctx.json({ error: "Failed to update profile" }, 500);
  }

  return ctx.json<UpdateProfileResponse>(
    {
      message: "Profile updated successfully",
      success: true,
      user: mapUserRowToUser(updatedRow),
    },
    200,
  );
}
