// middleware/requireSession.ts
import { getUserById } from "@packages/db/users";
import type { Context } from "hono";

export function requireSession(ctx: Context, next: () => Promise<void>) {
	// Temporary: hardcoded user id from seed
	const user = getUserById(1);

	if (!user) {
		return ctx.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Convert DB user -> app-safe context user
	ctx.user = user;
	return next();
}
