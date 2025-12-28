// middleware/requireSession.ts
import type { Context } from "hono";

export async function requireSession(ctx: Context, next: () => Promise<void>) {
	// Stub: in V1, attach a fake logged-in user
	ctx.user = { id: "stub-user-id", email: "stub@example.com" };

	// Continue to the next handler
	await next();
}
