// packages/auth/src/login.ts
import { db, sessions } from "@packages/db";
import { getUserByEmail } from "@packages/db/users";
import { verifyPassword } from "@shared/crypto/password";
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

	// Create a new session
	const sessionId = uuid();
	const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

	db.insert(sessions)
		.values({
			id: sessionId,
			userId: user.id,
			workspaceId: null,
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
