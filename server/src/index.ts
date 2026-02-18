// server/src/index.ts
import {
  loginHandler,
  logoutHandler,
  meHandler,
  signupHandler,
  updateProfileHandler,
} from "@auth";
import { Projects, Sessions, Workspaces } from "@db";
import type {} from "@shared/hono";
import type { ApiResponse } from "@shared/types/api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requireSession } from "./middleware/requireSession";
import { requireWorkspace } from "./middleware/requireWorkspace";

export const app = new Hono()
  .use(
    "*",
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  )
  .use("*", logger())

  // Top-level routes
  .get("/", (c) => c.text("Hello Hono!"))
  .get("/hello", (c) => {
    const data: ApiResponse = { message: "Hello BHVR!", success: true };
    return c.json(data, 200);
  })

  // Auth routes
  .post("/api/auth/login", loginHandler)
  .post("/api/auth/logout", logoutHandler)
  .post("/api/auth/signup", signupHandler)
  .get("/api/auth/me", requireSession, requireWorkspace, meHandler)
  .put("/api/auth/me", requireSession, requireWorkspace, updateProfileHandler)

  // Project routes

  // GET all projects for active workspace
  .get("/api/projects", requireSession, requireWorkspace, async (ctx) => {
    const workspaceId = ctx.workspace?.id;
    if (!workspaceId) return ctx.json({ error: "Forbidden" }, 403);

    const projects = await Projects.getProjectsByWorkspace(workspaceId);
    return ctx.json({ projects }, 200);
  })

  // GET single project (scoped for workspace)
  .get(
    "/api/projects/:projectId",
    requireSession,
    requireWorkspace,
    async (ctx) => {
      const workspaceId = ctx.workspace?.id;
      if (!workspaceId) return ctx.json({ error: "Forbidden" }, 403);

      const projectId = ctx.req.param("projectId");
      const project = await Projects.getProjectByIdForWorkspace(
        projectId,
        workspaceId,
      );

      if (!project) return ctx.json({ error: "Project not found" }, 404);
      return ctx.json(project, 200);
    },
  )

  // POST create project
  .post("/api/projects", requireSession, requireWorkspace, async (ctx) => {
    const workspaceId = ctx.workspace?.id;
    if (!workspaceId) return ctx.json({ error: "Forbidden" }, 403);

    const { name, description } = await ctx.req.json<{
      name: string;
      description?: string;
    }>();

    if (!name) return ctx.json({ error: "Name is required" }, 400);

    const project = await Projects.createProject({
      workspaceId,
      name,
      description: description ?? null,
    });

    return ctx.json({ project }, 201);
  })

  // PUT update project
  .put(
    "/api/projects/:projectId",
    requireSession,
    requireWorkspace,
    async (ctx) => {
      const workspaceId = ctx.workspace?.id;
      if (!workspaceId) return ctx.json({ error: "Forbidden" }, 403);

      const projectId = ctx.req.param("projectId");
      const { name, description } = await ctx.req.json<{
        name?: string;
        description?: string;
      }>();

      const updated = await Projects.updateProjectForWorkspace(
        projectId,
        workspaceId,
        {
          name,
          description:
            description === undefined ? undefined : (description ?? null),
        },
      );

      if (!updated) return ctx.json({ error: "Project not found" }, 404);
      return ctx.json({ message: "Project updated", success: true }, 200);
    },
  )

  // DELETE project
  .delete(
    "/api/projects/:projectId",
    requireSession,
    requireWorkspace,
    async (ctx) => {
      const workspaceId = ctx.workspace?.id;
      if (!workspaceId) return ctx.json({ error: "Forbidden" }, 403);

      const projectId = ctx.req.param("projectId");
      const ok = await Projects.deleteProjectForWorkspace(
        projectId,
        workspaceId,
      );

      if (!ok) return ctx.json({ error: "Project not found" }, 404);
      return ctx.json({ message: "Project deleted", success: true }, 200);
    },
  )

  // Workspace routes

  // List workspaces user belongs to
  .get("/api/workspaces", requireSession, async (ctx) => {
    const userId = ctx.user?.id;
    if (!userId) return ctx.json({ error: "Unauthorized" }, 401);

    const rows = await Workspaces.getWorkspacesForUser(userId);

    return ctx.json(
      { workspaces: rows ?? [] },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  })

  // Select active workspace for the current session
  .post("/api/workspaces/select", requireSession, async (ctx) => {
    const userId = ctx.user?.id;
    const sessionId = ctx.session?.id;
    if (!userId || !sessionId) return ctx.json({ error: "Unauthorized" }, 401);

    const { workspaceId } = await ctx.req.json<{ workspaceId: string }>();
    if (!workspaceId) return ctx.json({ error: "workspaceId required" }, 400);

    const ok = await Sessions.setSessionWorkspaceForUser({
      sessionId,
      userId,
      workspaceId,
    });

    if (!ok) return ctx.json({ error: "Forbidden" }, 403);
    return ctx.json({ message: "Workspace selected", success: true }, 200);
  });

export default app;
