import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { ApiResponse } from "shared/dist";
import { requireSession } from "./middleware/requireSession";
import { requireWorkspace } from "./middleware/requireWorkspace";

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

	.get("/protected", requireSession, (ctx) => {
		const user = ctx.user;
		return ctx.json({ message: `Hello, ${user?.email}` });
	})

	.get("/workspace", requireSession, requireWorkspace, (ctx) => {
		const user = ctx.user;
		const workspace = ctx.workspace;
		return ctx.json({
			message: `Hello ${user?.email}, you are in workspace ${workspace?.name}`,
		});
	});

export default app;
