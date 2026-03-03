// server/src/middleware/resolveTenent.ts
import "@shared/hono";
import type { Context, Next } from "hono";
import { Tenants } from "@db";

function getHostname(hostHeader: string | null): string {
  // Host may include port (e.g. acme.localhost:3000)
  const host = (hostHeader ?? "").trim();
  return (host.split(":")[0] ?? "").toLowerCase();
}

export function extractTenantSlug(hostname: string): string | null {
  // Examples:
  // — acme.localhost -> tenantSlug = acme
  // — localhost      -> null (no tenant)
  // — api.example.com -> (depends on your production scheme)
  if (!hostname) return null;

  // dev: <tenant>.localhost
  if (hostname.endsWith(".localhost")) {
    const slug = hostname.slice(0, -".localhost".length);
    return slug && slug !== "localhost" ? slug : null;
  }

  // prod idea (optional): <tenant>.<baseDomain>
  // if you set BASE_DOMAIN=example.com then:
  //  acme.example.com -> tenantSlug = acme
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

  console.log("[resolveTenant]", {
    host: ctx.req.header("host"),
    hostname,
    tenantSlug,
    tenantId: tenant?.id ?? null,
  });

  return next();
}
