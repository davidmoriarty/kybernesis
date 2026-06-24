// packages/auth/src/tenantSignup.ts
import { Flows, Tenants, DEFAULT_WORKSPACE_NAME } from "db";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./constants";
import { hashPassword } from "./crypto/password";
import type { TenantSignupInput } from "./types";

function slugifyTenant(input: string): string {
  // Lowercase, trim, replace runs of non-alphanum with '-', collapse '-', trim '-'
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function tenantSignupHandler(ctx: Context): Promise<Response> {
  let body: Partial<TenantSignupInput>;

  try {
    body = (await ctx.req.json()) as Partial<TenantSignupInput>;
  } catch {
    return ctx.json({ error: "Invalid JSON" }, 400);
  }

  const tenantName = body.tenantName?.trim();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;
  const defaultWorkspaceName = body.defaultWorkspaceName?.trim();

  if (!tenantName || !name || !email || !password) {
    return ctx.json(
      { error: "tenantName, name, email, and password are required" },
      400,
    );
  }

  const tenantSlug = slugifyTenant(tenantName);
  if (!tenantSlug) {
    return ctx.json({ error: "Invalid tenantName (cannot derive slug)" }, 400);
  }

  // Prefer slug uniqueness over name uniqueness (name can be non-unique if you want)
  const existingBySlug = await Tenants.getTenantBySlug(tenantSlug);
  if (existingBySlug) {
    return ctx.json({ error: "Tenant already exists" }, 409);
  }

  const passwordHash = await hashPassword(password);

  const { session } = await Flows.createTenantWithOwnerAndSession({
    tenantName,
    tenantSlug,
    owner: { name, email, passwordHash },
    sessionExpiresAt: new Date(Date.now() + SESSION_TTL_MS),
    defaultWorkspaceName: defaultWorkspaceName ?? DEFAULT_WORKSPACE_NAME,
  });

  setCookie(ctx, SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

  return ctx.json({ message: "Tenant created", success: true }, 201);
}
