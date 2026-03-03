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

  // tenant required for everything under /api/*
  .use("/projects/*", requireTenant, requireSession)
  .use("/projects", requireTenant, requireSession)
  .use("/workspaces/*", requireTenant, requireSession)
  .use("/workspaces", requireTenant, requireSession)
  .route("/projects", projectRoutes)
  .route("/workspaces", workspaceRoutes);
