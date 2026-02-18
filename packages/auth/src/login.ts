// packages/auth/src/login.ts
import { Sessions, Users, Workspaces } from "@db";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./constants";
import { verifyPassword } from "./crypto/password";
import type { LoginInput } from "./types";

export async function loginHandler(ctx: Context): Promise<Response> {
  const { email, password } = (await ctx.req.json()) as LoginInput;

  const user = await Users.getUserByEmail(email);
  if (!user) return ctx.json({ error: "Invalid email or password" }, 401);

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return ctx.json({ error: "Invalid email or password" }, 401);

  const workspaceId = await Workspaces.getAnyWorkspaceIdForUser(user.id);
  if (!workspaceId) return ctx.json({ error: "User has no workspace" }, 403);

  const session = await Sessions.createSession({
    userId: user.id,
    workspaceId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  if (!session) return ctx.json({ error: "Failed to create session" }, 500);

  setCookie(ctx, SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

  return ctx.json({ message: `Welcome, ${user.email}`, success: true }, 200);
}
