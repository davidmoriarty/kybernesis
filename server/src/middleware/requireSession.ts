// middleware/requireSession.ts
import { db, Sessions, Users, Workspaces } from "@db";
import { and, eq, gt } from "drizzle-orm";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export async function requireSession(ctx: Context, next: Next) {
  const sessionId = getCookie(ctx, "session_id");
  if (!sessionId) {
    return ctx.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);

  // Synchronous DB query for session
  const session = db
    .select()
    .from(Sessions.sessions)
    .where(
      and(
        eq(Sessions.sessions.id, sessionId),
        gt(Sessions.sessions.expiresAt, now),
      ),
    )
    .get();

  if (!session) {
    return ctx.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Synchronous user lookup
  const user = Users.getUserById(session.userId);
  if (!user) {
    return ctx.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Attach user and session to context
  ctx.user = { id: user.id, email: user.email };
  ctx.session = {
    id: session.id,
    userId: session.userId,
    workspaceId: session.workspaceId ?? null,
  };

  // Optionally, attach workspace if workspaceId exists
  if (session.workspaceId) {
    const workspace = db
      .select()
      .from(Workspaces.workspaces)
      .where(eq(Workspaces.workspaces.id, session.workspaceId))
      .get();

    if (workspace) {
      ctx.workspace = {
        id: String(workspace.id),
        name: workspace.name,
        role: "admin",
      };
    }
  }

  await next();
}
