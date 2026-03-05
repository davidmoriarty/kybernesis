// server/src/middleware/requireSession.ts
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
  TOUCH_EVERY_MS,
} from "@auth";
import { Sessions, Users, Workspaces, TenantMembers } from "@db";
import { mapUserRowToUser } from "@db/mappers";
import "@shared/hono";
import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export async function requireSession(ctx: Context, next: Next) {
  const tenantId = ctx.get("tenantId");
  if (!tenantId) return ctx.json({ error: "Tenant required" }, 400);

  const sessionId = getCookie(ctx, SESSION_COOKIE_NAME);
  if (!sessionId) return ctx.json({ error: "Unauthorized" }, 401);

  const session = await Sessions.getActiveSessionById({
    tenantId,
    sessionId,
  });

  if (!session) return ctx.json({ error: "Unauthorized" }, 401);

  // Sliding expiration (throttled)
  const updatedSession = await Sessions.touchAndExtendSessionIfStale(
    { tenantId, sessionId: session.id },
    {
      ttlMs: SESSION_TTL_MS,
      touchEveryMs: TOUCH_EVERY_MS,
    },
  );

  // If we extended it, refresh cookie maxAge too
  if (updatedSession) {
    setCookie(ctx, SESSION_COOKIE_NAME, session.id, {
      ...sessionCookieOptions,
      expires: updatedSession.expiresAt,
    });
  }

  const userRow = await Users.getUserById({
    tenantId,
    userId: session.userId,
  });

  if (!userRow) return ctx.json({ error: "Unauthorized" }, 401);

  await Users.touchLastSeenIfStale({
    tenantId,
    userId: userRow.id,
  });

  const tenantRole = await TenantMembers.getTenantRoleForUser(
    tenantId,
    userRow.id,
  );
  if (!tenantRole) return ctx.json({ error: "Unauthorized" }, 401);

  ctx.set("tenantRole", tenantRole);
  ctx.set("user", mapUserRowToUser(userRow));
  ctx.set("session", {
    id: session.id,
    tenantId,
    userId: session.userId,
    workspaceId: session.workspaceId ?? null,
  });

  if (session.workspaceId) {
    const workspaceWithRole = await Workspaces.getWorkspaceWithRoleForUser({
      tenantId,
      userId: session.userId,
      workspaceId: session.workspaceId,
    });

    if (workspaceWithRole) {
      ctx.set("workspace", {
        id: workspaceWithRole.id,
        tenantId,
        name: workspaceWithRole.name,
        role: workspaceWithRole.role,
      });

      ctx.set("workspaceMember", {
        workspaceId: session.workspaceId,
        role: workspaceWithRole.role,
      });
    } else {
      // user is no longer allowed in that workspace — clear it
      await Sessions.clearSessionWorkspace({
        tenantId,
        sessionId: session.id,
      });

      // also update ctx session view for the rest of this request
      ctx.set("session", {
        id: session.id,
        tenantId,
        userId: session.userId,
        workspaceId: null,
      });
    }
  }

  await next();
}
