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
  const fromCtx = ctx.get?.("tenantId") as string | null | undefined;
  return fromCtx ?? bodyTenantId ?? null;
}

export async function userSignupHandler(ctx: Context): Promise<Response> {
  let body: Partial<UserSignupInput>;

  try {
    body = (await ctx.req.json()) as Partial<UserSignupInput>;
  } catch {
    return ctx.json({ error: "Invalid JSON" }, 400);
  }

  const tenantId = getTenantId(ctx, body.tenantId);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!tenantId) return ctx.json({ error: "Tenant is required" }, 400);
  if (!name || !email || !password) {
    return ctx.json({ error: "Name, email, and password are required" }, 400);
  }

  const existingGlobal = await Users.getUserByEmailGlobal({ email });
  if (existingGlobal) {
    const existingTenant = await Users.getUserByEmailInTenant({
      tenantId,
      email,
    });

    if (existingTenant) {
      return ctx.json({ error: "User already exists in this tenant" }, 409);
    }

    return ctx.json({ error: "User already exists. Use login instead." }, 409);
  }

  const passwordHash = await hashPassword(password);

  const { session } = await Flows.createUserInTenantWithSession({
    tenantId,
    user: { name, email, passwordHash },
    tenantRole: "member",
    sessionExpiresAt: new Date(Date.now() + SESSION_TTL_MS),

    workspaceId: body.workspaceId ?? null,
    addWorkspaceMembership: !!body.workspaceId,
  });

  setCookie(ctx, SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

  return ctx.json({ message: "Account created", success: true }, 201);
}
