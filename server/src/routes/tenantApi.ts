// server/src/routes/tenantApi.ts
import { Hono } from "hono";
import { requireTenant } from "../middleware/requireTenant";
import { requireSession } from "../middleware/requireSession";

import { authRoutes } from "./auth";
import { projectRoutes } from "./projects";
import { taskRoutes } from "./tasks";
import { workspaceRoutes } from "./workspaces";

export const tenantApi = new Hono()
  .get("/tenant-context", (ctx) => {
    return ctx.json({
      surface: ctx.get("surface"),
      tenantSlug: ctx.get("tenantSlug"),
      tenantId: ctx.get("tenantId"),
    });
  })

  // auth endpoints (login/logout/signup) must NOT require session
  .route("/auth", authRoutes)

  // projects still enforced here
  .use("/projects/*", requireTenant, requireSession)
  .use("/projects", requireTenant, requireSession)

  // tasks item endpoints
  .use("/tasks/*", requireTenant, requireSession)
  .use("/tasks", requireTenant, requireSession)

  // only require tenant here
  .use("/workspaces/*", requireTenant, requireSession)
  .use("/workspaces", requireTenant, requireSession)

  .route("/projects", projectRoutes)
  .route("/", taskRoutes)
  .route("/workspaces", workspaceRoutes);
