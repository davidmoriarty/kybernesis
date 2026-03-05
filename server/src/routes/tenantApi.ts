// server/src/routes/tenantApi.ts
import { Hono } from "hono";
import { requireTenant } from "../middleware/requireTenant";
import { requireSession } from "../middleware/requireSession";

import { authRoutes } from "./auth";
import { projectRoutes } from "./projects";
import { workspaceRoutes } from "./workspaces";

export const tenantApi = new Hono()
  // auth endpoints (login/logout/signup) must NOT require session
  .route("/auth", authRoutes)

  // projects still enforced here
  .use("/projects/*", requireTenant, requireSession)
  .use("/projects", requireTenant, requireSession)

  // only require tenant here
  .use("/workspaces/*", requireTenant)
  .use("/workspaces", requireTenant)

  .route("/projects", projectRoutes)
  .route("/workspaces", workspaceRoutes);
