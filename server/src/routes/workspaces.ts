// server/src/routes/workspaces.ts
import { db, sessions, workspaceMembers, workspaces } from "@packages/db";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { requireSession } from "../middleware/requireSession";

export const workspaceRoutes = new Hono();

workspaceRoutes.get("/", requireSession, (ctx) => {
	const userId = ctx.user?.id;
	if (!userId) {
		return ctx.json({ error: "Unauthorized" }, { status: 401 });
	}

	const rows = db
		.select({
			id: workspaces.id,
			name: workspaces.name,
			role: workspaceMembers.role,
		})
		.from(workspaceMembers)
		.innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
		.where(eq(workspaceMembers.userId, userId))
		.all();

	return ctx.json({ workspaces: rows }, { status: 200 });
});

workspaceRoutes.post("/select", requireSession, async (ctx) => {
	const userId = ctx.user?.id;
	const sessionId = ctx.session?.id;
	if (!userId || !sessionId) {
		return ctx.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { workspaceId } = await ctx.req.json<{ workspaceId: number }>();
	if (!workspaceId) {
		return ctx.json({ error: "workspaceId required" }, { status: 400 });
	}

	// Verify membership
	const membership = db
		.select()
		.from(workspaceMembers)
		.where(
			and(
				eq(workspaceMembers.userId, userId),
				eq(workspaceMembers.workspaceId, workspaceId),
			),
		)
		.get();

	if (!membership) {
		return ctx.json({ error: "Forbidden" }, { status: 403 });
	}

	// Bind workspace to session
	db.update(sessions)
		.set({ workspaceId })
		.where(eq(sessions.id, sessionId))
		.run();

	return ctx.json({ message: "Workspace selected" }, { status: 200 });
});
