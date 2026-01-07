// packages/auth/src/login.ts
import { db, Sessions, Users, WorkspaceMembers, Workspaces } from "@db";
import { verifyPassword } from "@shared";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { v4 as uuid } from "uuid";

export async function loginHandler(ctx: Context) {
  const { email, password } = await ctx.req.json();

  const user = Users.getUserByEmail(email);
  if (!user) {
    return ctx.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return ctx.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // Resolve a workspace for this user (owner or member)
  const ownedWorkspace = db
    .select()
    .from(Workspaces.workspaces)
    .where(eq(Workspaces.workspaces.ownerId, user.id))
    .get();

  const memberWorkspace = !ownedWorkspace
    ? db
        .select()
        .from(WorkspaceMembers.workspaceMembers)
        .where(eq(WorkspaceMembers.workspaceMembers.userId, user.id))
        .get()
    : null;

  const workspaceId =
    ownedWorkspace?.id ?? memberWorkspace?.workspaceId ?? null;

  if (!workspaceId) {
    return ctx.json({ error: "User has no workspace" }, { status: 403 });
  }

  // Create session with workspace_id
  const sessionId = uuid();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

  db.insert(Sessions.sessions)
    .values({
      id: sessionId,
      userId: user.id,
      workspaceId,
      expiresAt,
    })
    .run();

  setCookie(ctx, "session_id", sessionId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24,
  });

  console.log("Set session_id cookie:", sessionId);

  return ctx.json({ message: `Welcome, ${user.email}` }, { status: 200 });
}
