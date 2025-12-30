// packages/auth/src/logout.ts
import { db, sessions } from "@packages/db";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";

export async function logoutHandler(ctx: Context) {
	const sessionId = getCookie(ctx, "session_id");

	if (sessionId) {
		db.delete(sessions).where(eq(sessions.id, sessionId)).run();

		deleteCookie(ctx, "session_id", { path: "/" });
	}

	return ctx.json({ message: "Logged out" }, { status: 200 });
}
