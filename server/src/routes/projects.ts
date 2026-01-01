// server/src/routes/projects.ts
import { db, projects } from "@packages/db";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { requireSession } from "../middleware/requireSession";
import { requireWorkspace } from "../middleware/requireWorkspace";

export const projectRoutes = new Hono();

// GET all projects in the workspace
projectRoutes.get("/", requireSession, requireWorkspace, (ctx) => {
	const workspaceId = Number(ctx.workspace?.id);
	const allProjects = db
		.select()
		.from(projects)
		.where(eq(projects.workspaceId, workspaceId))
		.all();
	return ctx.json({ projects: allProjects });
});

// POST create a new project
projectRoutes.post("/", requireSession, requireWorkspace, async (ctx) => {
	const workspaceId = Number(ctx.workspace?.id);
	const { name, description } = await ctx.req.json<{
		name: string;
		description?: string;
	}>();

	const createdAt = Math.floor(Date.now() / 1000);
	db.insert(projects)
		.values({ workspaceId, name, description, createdAt })
		.run();

	return ctx.json({ message: "Project created" }, { status: 201 });
});
