// server/src/middleware/resolveTenant.ts
import type {} from "shared/hono";
import type { Context, Next } from "hono";
import { Tenants } from "db";

function getHostname(hostHeader: string | null): string {
  const host = (hostHeader ?? "").trim();
  return (host.split(":")[0] ?? "").toLowerCase();
}

export function extractTenantSlug(hostname: string): string | null {
  if (!hostname) return null;

  if (hostname.endsWith(".localhost")) {
    const slug = hostname.slice(0, -".localhost".length);
    return slug && slug !== "localhost" ? slug : null;
  }

  const baseDomain = process.env.BASE_DOMAIN?.toLowerCase();
  if (baseDomain && hostname.endsWith(`.${baseDomain}`)) {
    const slug = hostname.slice(0, -(baseDomain.length + 1));
    return slug || null;
  }

  return null;
}

export async function resolveTenant(ctx: Context, next: Next) {
  const hostname = getHostname(ctx.req.header("host") ?? null);
  const tenantSlug = extractTenantSlug(hostname);

  ctx.set("tenantSlug", tenantSlug);

  if (!tenantSlug) {
    ctx.set("tenantId", null);
    return next();
  }

  const tenant = await Tenants.getTenantBySlug(tenantSlug);
  ctx.set("tenantId", tenant?.id ?? null);

  if (process.env.NODE_ENV !== "production") {
    console.log("[resolveTenant]", {
      host: ctx.req.header("host"),
      hostname,
      tenantSlug,
      tenantId: tenant?.id ?? null,
    });
  }

  return next();
}
