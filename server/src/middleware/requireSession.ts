import { SESSION_COOKIE_NAME } from "@auth";
import { Sessions, UserMappers, Users, Workspaces } from "@db";
import type {} from "@shared/hono";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export async function requireSession(ctx: Context, next: Next) {
  const sessionId = getCookie(ctx, SESSION_COOKIE_NAME);
  if (!sessionId) return ctx.json({ error: "Unauthorized" }, 401);

  const session = await Sessions.getActiveSessionById(sessionId);
  if (!session) return ctx.json({ error: "Unauthorized" }, 401);

  const user = await Users.getUserById(session.userId);
  if (!user) return ctx.json({ error: "Unauthorized" }, 401);

  ctx.user = UserMappers.mapUserRowToUser(user);

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
