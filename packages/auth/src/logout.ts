// packages/auth/src/logout.ts
import { Sessions } from "@db";
import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { SESSION_COOKIE_NAME } from "./constants";

export async function logoutHandler(ctx: Context): Promise<Response> {
  const sessionId = getCookie(ctx, SESSION_COOKIE_NAME);

  if (sessionId) {
    await Sessions.revokeSession(sessionId);
    deleteCookie(ctx, SESSION_COOKIE_NAME, { path: "/" });
  }

  return ctx.json({ message: "Logged out", success: true }, 200);
}
