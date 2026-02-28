import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
  TOUCH_EVERY_MS,
} from "@auth";
import { Sessions, Users, Workspaces } from "@db";
import { mapUserRowToUser } from "@db/mappers";
import type {} from "@shared/hono";
import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";

export async function requireSession(ctx: Context, next: Next) {
  const sessionId = getCookie(ctx, SESSION_COOKIE_NAME);
  if (!sessionId) return ctx.json({ error: "Unauthorized" }, 401);

  const session = await Sessions.getActiveSessionById(sessionId);
  if (!session) return ctx.json({ error: "Unauthorized" }, 401);

  // Sliding expiration (throttled)
  const updatedSession = await Sessions.touchAndExtendSessionIfStale(
    session.id,
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

  const user = await Users.getUserById(session.userId);
  if (!user) return ctx.json({ error: "Unauthorized" }, 401);

  // Attach context
  ctx.user = mapUserRowToUser(user);

  ctx.session = {
    id: session.id,
    userId: session.userId,
    workspaceId: session.workspaceId ?? null,
  };

  if (session.workspaceId) {
    const workspaceWithRole = await Workspaces.getWorkspaceWithRoleForUser(
      user.id,
      session.workspaceId,
    );

    if (workspaceWithRole) {
      ctx.workspace = {
        id: workspaceWithRole.id,
        name: workspaceWithRole.name,
        role: workspaceWithRole.role,
      };

      ctx.workspaceMember = {
        workspaceId: session.workspaceId,
        role: workspaceWithRole.role,
      };
    }
  }

  await next();
}
