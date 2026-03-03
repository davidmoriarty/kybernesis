// server/src/middleware/requireTenant.ts
import { Tenants } from "@db";
import "@shared/hono";
import type { Context, Next } from "hono";

export async function requireTenant(ctx: Context, next: Next) {
  const tenantSlug = ctx.get("tenantSlug");
  const tenantId = ctx.get("tenantId");

  console.log("[requireTenant] before", {
    tenantSlug,
    tenantId,
    path: ctx.req.path,
  });

  if (!tenantSlug) return ctx.json({ error: "Tenant required" }, 400);

  // If resolveTenant already resolved it, just require it
  if (tenantId) return next();

  // Fallback: resolve by slug
  const tenant = await Tenants.getTenantBySlug(tenantSlug);

  console.log("[requireTenant] after lookup", {
    tenantFound: Boolean(tenant),
    tenantId: tenant?.id,
  });

  if (!tenant) return ctx.json({ error: "Tenant not found" }, 404);

  ctx.set("tenantId", tenant.id);
  return next();
}
