// packages/auth/src/login.ts
import { db, sessions, workspaceMembers, workspaces } from "@packages/db";
import { getUserByEmail } from "@packages/db/users";
import { verifyPassword } from "@shared/crypto/password";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { v4 as uuid } from "uuid";

export async function loginHandler(ctx: Context) {
	const { email, password } = await ctx.req.json();

	const user = getUserByEmail(email);
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
		.from(workspaces)
		.where(eq(workspaces.ownerId, user.id))
		.get();

	const memberWorkspace = !ownedWorkspace
		? db
				.select()
				.from(workspaceMembers)
				.where(eq(workspaceMembers.userId, user.id))
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

	db.insert(sessions)
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
		secure: process.env.NODE_ENV === "production",
		maxAge: 60 * 60 * 24,
	});

	return ctx.json({ message: `Welcome, ${user.email}` }, { status: 200 });
}
