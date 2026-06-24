// server/src/middleware/requireTenantAdmin.ts
import { TenantMembers } from "db";
import type {} from "shared/hono";
import type { Context, Next } from "hono";

type AllowedTenantRole = "owner" | "admin";

export function requireTenantAdmin(
  allowed: AllowedTenantRole[] = ["owner", "admin"],
) {
  return async (ctx: Context, next: Next) => {
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!session?.tenantId || !user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const resolvedTenantId = ctx.get("tenantId");
    if (resolvedTenantId && resolvedTenantId !== session.tenantId) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    // Prefer role from requireSession
    let role = ctx.get("tenantRole");

    if (!role) {
      role = await TenantMembers.getTenantRoleForUser(
        session.tenantId,
        user.id,
      );
      if (!role) return ctx.json({ error: "Forbidden" }, 403);

      ctx.set("tenantRole", role);
    }

    // Only allow tenant/admin
    if (role !== "owner" && role !== "admin") {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    if (!allowed.includes(role)) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    await next();
  };
}
