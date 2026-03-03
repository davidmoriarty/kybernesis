// server/src/routes/workspaces.ts
import { Hono } from "hono";
import "@shared/hono";
import { Sessions, Workspaces, WorkspaceMembers, Projects } from "@db";
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

  // Workspace dashboard summary (requires active workspace)
  .get("/summary", requireWorkspace, async (ctx) => {
    const session = ctx.get("session");
    const workspace = ctx.get("workspace");

    if (!session?.tenantId || !workspace?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const workspaceId = workspace.id;

    const members = await WorkspaceMembers.getMembersForWorkspace(workspaceId);

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

  // Select active workspace for the current session
  .post("/select", async (ctx) => {
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!session?.id || !session.tenantId || !user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const { workspaceId } = await ctx.req.json<{ workspaceId: string }>();
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
