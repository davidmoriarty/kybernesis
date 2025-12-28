// middleware/requireWorkspace.ts
import type { Context } from "hono";

export async function requireWorkspace(
	ctx: Context,
	next: () => Promise<void>,
) {
	// Stub: just attach a default workspace for now
	ctx.workspace = {
		id: "stub-workspace-id",
		name: "Demo Workspace",
		role: "admin",
	};

	// Continue to next handler
	await next();
}
