// middleware/requireSession.ts
import { db, sessions } from "@packages/db";
import { getUserById } from "@packages/db/users";
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
		.from(sessions)
		.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
		.get();

	if (!session) {
		return ctx.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Synchronous user lookup
	const user = getUserById(session.userId);
	if (!user) {
		return ctx.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Attach user and workspace to context
	ctx.user = { id: user.id, email: user.email };
	ctx.workspace = session.workspaceId
		? { id: String(session.workspaceId) }
		: undefined;

	await next();
}
