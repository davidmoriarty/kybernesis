// server/src/index.ts
import { loginHandler } from "@auth/login";
import { logoutHandler } from "@auth/logout";
import { meHandler } from "@auth/me";
import { db, Projects, Sessions, WorkspaceMembers, Workspaces } from "@db";
import type { ApiResponse } from "@shared/types/api";
import { and, eq } from "drizzle-orm";
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
  .get("/hello", async (c) => {
    const data: ApiResponse = {
      message: "Hello BHVR!",
      success: true,
    };
    return c.json(data, { status: 200 });
  })

  // Auth routes
  .post("/auth/login", loginHandler)
  .post("/auth/logout", logoutHandler)
  .get("/auth/me", requireSession, requireWorkspace, meHandler)

  // Project routes
  .get("/projects", requireSession, requireWorkspace, (ctx) => {
    const workspaceId = Number(ctx.workspace?.id);
    const allProjects = db
      .select()
      .from(Projects.projects)
      .where(eq(Projects.projects.workspaceId, workspaceId))
      .all();
    return ctx.json({ projects: allProjects });
  })

  // POST create a new project
  .post("/projects", requireSession, requireWorkspace, async (ctx) => {
    const workspaceId = Number(ctx.workspace?.id);
    const { name, description } = await ctx.req.json<{
      name: string;
      description?: string;
    }>();

    const createdAt = Math.floor(Date.now() / 1000);

    db.insert(Projects.projects)
      .values({ workspaceId, name, description, createdAt })
      .run();

    return ctx.json({ message: "Project created" }, { status: 201 });
  })

  // Workspace routes
  .get("/workspaces", requireSession, (ctx) => {
    const userId = ctx.user?.id;
    if (!userId) {
      return ctx.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = db
      .select({
        id: Workspaces.workspaces.id,
        name: Workspaces.workspaces.name,
        role: WorkspaceMembers.workspaceMembers.role,
      })
      .from(WorkspaceMembers.workspaceMembers)
      .innerJoin(
        Workspaces.workspaces,
        eq(
          WorkspaceMembers.workspaceMembers.workspaceId,
          Workspaces.workspaces.id,
        ),
      )
      .where(eq(WorkspaceMembers.workspaceMembers.userId, userId))
      .all();

    return ctx.json({ workspaces: rows }, { status: 200 });
  })

  .post("/workspaces/select", requireSession, async (ctx) => {
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
      .from(WorkspaceMembers.workspaceMembers)
      .where(
        and(
          eq(WorkspaceMembers.workspaceMembers.userId, userId),
          eq(WorkspaceMembers.workspaceMembers.workspaceId, workspaceId),
        ),
      )
      .get();

    if (!membership) {
      return ctx.json({ error: "Forbidden" }, { status: 403 });
    }

    // Bind workspace to session
    db.update(Sessions.sessions)
      .set({ workspaceId })
      .where(eq(Sessions.sessions.id, sessionId))
      .run();

    return ctx.json({ message: "Workspace selected" }, { status: 200 });
  });

export default app;
