// server/src/index.ts
import type { ApiResponse } from "@shared/types/api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requireSession } from "./middleware/requireSession";
import { requireWorkspace } from "./middleware/requireWorkspace";
import { authRoutes } from "./routes/auth";
import { projectRoutes } from "./routes/projects";
import { workspaceRoutes } from "./routes/workspaces";

export const app = new Hono()
	.use(cors())
	.use(logger())

	.get("/", (c) => {
		return c.text("Hello Hono!");
	})
	.get("/hello", async (c) => {
		const data: ApiResponse = {
			message: "Hello BHVR!",
			success: true,
		};
		return c.json(data, { status: 200 });
	})

	.route("/auth", authRoutes)
	.route("/workspaces", workspaceRoutes)
	.route("/projects", projectRoutes)

	.get("/protected", requireSession, (ctx) => {
		return ctx.json({
			message: `Hello, ${ctx.user?.email}`,
		});
	})

	.get("/workspace", requireSession, requireWorkspace, (ctx) => {
		return ctx.json({
			message: `Hello ${ctx.user?.email}, you are in workspace ${ctx.workspace?.name}`,
		});
	});

export default app;
