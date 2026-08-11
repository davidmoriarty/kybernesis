// packages/auth/src/login.ts

import { Sessions, Tenants, Users, Workspaces } from "db";
import type {} from "shared/hono";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./constants";
import { verifyPassword } from "./crypto/password";
import type { LoginInput } from "./types";

function isLoginInput(x: unknown): x is LoginInput {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.email === "string" && typeof o.password === "string";
}

async function resolveTenantId(ctx: Context): Promise<string> {
  const fromCtx = ctx.get("tenantId");
  if (fromCtx) return fromCtx;

  const tenantSlug = ctx.get("tenantSlug");
  if (!tenantSlug) throw new Error("TENANT_REQUIRED");

  // Fallback: resolve from tenantSlug if present
  const tenant = await Tenants.getTenantBySlug(tenantSlug);
  if (!tenant) throw new Error("TENANT_NOT_FOUND");

  return tenant.id;
}

export async function loginHandler(ctx: Context): Promise<Response> {
  let tenantId: string;
  try {
    tenantId = await resolveTenantId(ctx);
  } catch (e) {
    if (e instanceof Error && e.message === "TENANT_REQUIRED") {
      return ctx.json({ error: "Tenant required" }, 400);
    }
    if (e instanceof Error && e.message === "TENANT_NOT_FOUND") {
      return ctx.json({ error: "Tenant not found" }, 404);
    }
    return ctx.json({ error: "Tenant not found" }, 404);
  }

  let body: unknown;
  try {
    body = await ctx.req.json();
  } catch {
    return ctx.json({ error: "Invalid JSON" }, 400);
  }

  if (!isLoginInput(body)) {
    return ctx.json({ error: "Email and password are required" }, 400);
  }

  const email = body.email.trim().toLowerCase();
  const { password } = body;

  const user = await Users.getUserByEmailInTenant({ tenantId, email });
  if (!user) return ctx.json({ error: "Invalid email or password" }, 401);

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return ctx.json({ error: "Invalid email or password" }, 401);

  const workspaceId = await Workspaces.getAnyWorkspaceIdForUser({
    tenantId,
    userId: user.id,
  });
  if (!workspaceId) return ctx.json({ error: "User has no workspace" }, 403);

  const session = await Sessions.createSession({
    tenantId,
    userId: user.id,
    workspaceId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  if (!session) return ctx.json({ error: "Failed to create session" }, 500);

  setCookie(ctx, SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

  return ctx.json({ message: `Welcome, ${user.email}`, success: true }, 200);
}
