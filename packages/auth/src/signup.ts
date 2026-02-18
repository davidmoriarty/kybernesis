// packages/auth/src/signup.ts
import { db, Sessions, Users, WorkspaceMembers, Workspaces } from "@db";

type DbTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./constants";
import { hashPassword } from "./crypto/password";
import type { SignupInput } from "./types";

export async function signupHandler(ctx: Context): Promise<Response> {
  const { name, email, password } = (await ctx.req.json()) as SignupInput;

  if (!name || !email || !password) {
    return ctx.json({ error: "Name, email, and password are required" }, 400);
  }

  const existingUser = await Users.getUserByEmail(email);
  if (existingUser) return ctx.json({ error: "User already exists" }, 409);

  const passwordHash = await hashPassword(password);

  const result = await db.transaction(async (tx: DbTx) => {
    const user = (
      await tx
        .insert(Users.users)
        .values({
          name,
          email,
          passwordHash,
          nickname: null,
          timezone: null,
          location: null,
          avatar: null,
        })
        .returning()
    )[0];

    if (!user) throw new Error("Failed to create user");

    const workspace = (
      await tx
        .insert(Workspaces.workspaces)
        .values({
          name: `${name}'s Workspace`,
          ownerId: user.id,
        })
        .returning()
    )[0];
    if (!workspace) throw new Error("Failed to create workspace");

    await tx.insert(WorkspaceMembers.workspaceMembers).values({
      userId: user.id,
      workspaceId: workspace.id,
      role: "admin",
    });

    const session = await Sessions.createSessionTx(tx, {
      userId: user.id,
      workspaceId: workspace.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });
    if (!session) throw new Error("Failed to create session");

    return { sessionId: session.id };
  });

  setCookie(ctx, SESSION_COOKIE_NAME, result.sessionId, sessionCookieOptions);

  return ctx.json({ message: "Account created", success: true }, 201);
}
