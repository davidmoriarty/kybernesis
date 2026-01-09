// packages/auth/src/signup.ts
import { db, Sessions, Users, WorkspaceMembers, Workspaces } from "@db";
import { hashPassword } from "@shared";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { v4 as uuid } from "uuid";

export async function signupHandler(ctx: Context) {
  const { email, password } = await ctx.req.json();

  if (!email || !password) {
    return ctx.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const existingUser = Users.getUserByEmail(email);
  if (existingUser) {
    return ctx.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const { userId, workspaceId } = db.transaction(() => {
    const user = db
      .insert(Users.users)
      .values({
        email,
        passwordHash,
      })
      .returning()
      .get();

    const workspace = db
      .insert(Workspaces.workspaces)
      .values({
        name: "My Workspace",
        ownerId: user.id,
      })
      .returning()
      .get();

    db.insert(WorkspaceMembers.workspaceMembers)
      .values({
        userId: user.id,
        workspaceId: workspace.id,
        role: "admin",
      })
      .run();

    return {
      userId: user.id,
      workspaceId: workspace.id,
    };
  });

  // Create session (same as login)
  const sessionId = uuid();
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

  db.insert(Sessions.sessions)
    .values({
      id: sessionId,
      userId,
      workspaceId,
      expiresAt,
    })
    .run();

  // 4. Set cookies
  setCookie(ctx, "session_id", sessionId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24,
  });

  // 5. Return response
  console.log("Set session_id cookie:", sessionId);

  return ctx.json({ message: "Account created" }, { status: 201 });
}
