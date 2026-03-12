// server/src/routes/workspaces.ts
import { Hono } from "hono";
import "@shared/hono";
import { Events, Projects, Sessions, Workspaces, WorkspaceMembers } from "@db";
import { requireSession } from "../middleware/requireSession";
import { requireWorkspace } from "../middleware/requireWorkspace";

export const workspaceRoutes = new Hono()
  .use("*", requireSession)

  // List workspaces user belongs to
  .get("/", async (ctx) => {
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!session?.tenantId || !user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const rows = await Workspaces.getWorkspacesForUser({
      tenantId: session.tenantId,
      userId: user.id,
    });

    return ctx.json(
      { workspaces: rows ?? [] },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  })

  .get("/:workspaceId/events", requireWorkspace, async (ctx) => {
    const workspace = ctx.get("workspace");

    if (!workspace?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const events = await Events.getWorkspaceEvents(workspace.id);

    return ctx.json(events, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  })

  // Workspace dashboard summary (requires active workspace)
  .get("/summary", requireWorkspace, async (ctx) => {
    const session = ctx.get("session");
    const workspace = ctx.get("workspace");

    if (!session?.tenantId || !workspace?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const workspaceId = workspace.id;

    const members = await WorkspaceMembers.getMembersForWorkspaceForTenant({
      tenantId: session.tenantId,
      workspaceId,
    });

    const recentProjects = await Projects.getRecentProjectsForTenantWorkspace(
      session.tenantId,
      workspaceId,
      5,
    );

    const projectCount = await Projects.getProjectCountForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId,
    });

    const ONLINE_MS = 5 * 60 * 1000;
    const now = Date.now();

    const membersWithStatus = members.map((m) => {
      const last = m.lastSeenAt ? new Date(m.lastSeenAt).getTime() : 0;
      const isOnline = last > 0 && now - last < ONLINE_MS;

      return {
        id: m.userId,
        name: m.name,
        email: m.email,
        role: m.role,
        status: isOnline ? "online" : "offline",
        lastSeenAt: m.lastSeenAt ? m.lastSeenAt.toISOString() : null,
      } as const;
    });

    return ctx.json(
      {
        workspace,
        counts: {
          members: members.length,
          activeProjects: projectCount,
          completedProjects: 0,
        },
        members: membersWithStatus,
        recentProjects,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  })

  .post("/", async (ctx) => {
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!session?.tenantId || !user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    let body: unknown;
    try {
      body = await ctx.req.json();
    } catch {
      return ctx.json({ error: "Invalid JSON" }, 400);
    }

    const { name } = body as { name?: string };

    if (!name || name.trim().length === 0) {
      return ctx.json({ error: "Workspace name required" }, 400);
    }

    const workspace = await Workspaces.createWorkspace({
      tenantId: session.tenantId,
      name: name.trim(),
      creatorUserId: user.id,
    });

    return ctx.json(workspace, { status: 201 });
  })

  // Select active workspace for the current session
  .post("/select", async (ctx) => {
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!session?.id || !session.tenantId || !user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    let body: unknown;
    try {
      body = await ctx.req.json();
    } catch {
      return ctx.json({ error: "Invalid JSON" }, 400);
    }

    const { workspaceId } = body as { workspaceId?: string };
    if (!workspaceId) return ctx.json({ error: "workspaceId required" }, 400);

    const ok = await Sessions.setSessionWorkspaceForUser({
      tenantId: session.tenantId,
      sessionId: session.id,
      userId: user.id,
      workspaceId,
    });

    if (!ok) return ctx.json({ error: "Forbidden" }, 403);
    return ctx.json({ message: "Workspace selected", success: true }, 200);
  });
