// packages/auth/src/userSignup.ts
import { Flows, Users } from "@db";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { hashPassword } from "./crypto/password";
import type { UserSignupInput } from "./types";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./constants";

function getTenantId(ctx: Context, bodyTenantId?: string) {
  // Prefer a tenant resolved by middleware (recommended)
  const fromCtx =
    (ctx.get?.("tenant") as { id?: string } | undefined)?.id ??
    (ctx.get?.("tenantId") as string | undefined);

  return fromCtx ?? bodyTenantId ?? null;
}

export async function userSignupHandler(ctx: Context): Promise<Response> {
  const body = (await ctx.req.json()) as Partial<UserSignupInput>;

  const tenantId = getTenantId(ctx, body.tenantId);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!tenantId) return ctx.json({ error: "Tenant is required" }, 400);
  if (!name || !email || !password) {
    return ctx.json({ error: "Name, email, and password are required" }, 400);
  }

  const existingUser = await Users.getUserByEmail({ tenantId, email });
  if (existingUser) return ctx.json({ error: "User already exists" }, 409);

  const passwordHash = await hashPassword(password);

  const { session } = await Flows.createUserInTenantWithSession({
    tenantId,
    user: { name, email, passwordHash },
    tenantRole: "member",
    sessionExpiresAt: new Date(Date.now() + SESSION_TTL_MS),

    // Optional: if you're allowing workspace enrollment at signup
    workspaceId: body.workspaceId ?? null,
    addWorkspaceMembership: !!body.workspaceId,
  });

  setCookie(ctx, SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

  return ctx.json({ message: "Account created", success: true }, 201);
}
