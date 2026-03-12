// server/src/routes/projects.ts
import { Hono } from "hono";
import "@shared/hono";
import { Users, Projects } from "@db";
import { requireWorkspace } from "../middleware/requireWorkspace";
import {
  requireProjectMember,
  requireProjectAdmin,
  requireWorkspaceAdmin,
} from "../middleware/rbac";
import {
  addProjectMember,
  removeProjectMember,
  createProjectMembership,
  listProjectIdsForUserInWorkspace,
  getMembersForProject,
} from "@db/projectMembers";

export const projectRoutes = new Hono()
  .use("*", requireWorkspace)

  // GET all projects for active workspace
  .get("/", async (ctx) => {
    const session = ctx.get("session");
    const workspace = ctx.get("workspace");

    if (!session?.tenantId || !session?.userId || !workspace?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    // Admin sees all projects in workspace (current behavior)
    if (workspace.role === "admin") {
      const projects = await Projects.getProjectsForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
      });

      return ctx.json({ projects }, 200);
    }

    // Member sees only projects they belong to
    const projectIds = await listProjectIdsForUserInWorkspace({
      userId: session.userId,
      workspaceId: workspace.id,
    });

    const projects = await Projects.getProjectsByIdsForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
      projectIds,
    });

    return ctx.json({ projects }, 200);
  })

  // GET single project (tenant + workspace scoped)
  .get("/:projectId", requireProjectMember("projectId"), async (ctx) => {
    const session = ctx.get("session");
    const workspace = ctx.get("workspace");

    if (!session?.tenantId || !workspace?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const projectId = ctx.req.param("projectId");

    const project = await Projects.getProjectByIdForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
      projectId,
    });

    if (!project) return ctx.json({ error: "Project not found" }, 404);
    return ctx.json(project, 200);
  })

  // POST create project
  .post("/", requireWorkspaceAdmin(), async (ctx) => {
    const workspace = ctx.get("workspace");
    if (!workspace?.id) return ctx.json({ error: "Forbidden" }, 403);

    const user = ctx.get("user");
    if (!user?.id) return ctx.json({ error: "Unauthorized" }, 401);

    const { name, description } = await ctx.req.json<{
      name: string;
      description?: string;
    }>();

    if (!name) return ctx.json({ error: "Name is required" }, 400);

    const project = await Projects.createProject({
      workspaceId: workspace.id,
      name,
      description: description ?? null,
      actorId: user.id,
    });

    await createProjectMembership({
      projectId: project.id,
      userId: user.id,
      role: "admin",
    });

    return ctx.json({ project }, 201);
  })

  .get("/:projectId/members", requireWorkspaceAdmin(), async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");
    if (!workspace?.id || !session?.tenantId) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const projectId = ctx.req.param("projectId");

    // Ensure project belongs to active workspace
    const project = await Projects.getProjectByIdForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
      projectId,
    });
    if (!project) return ctx.json({ error: "Project not found" }, 404);

    const members = await getMembersForProject(projectId);
    return ctx.json({ members }, 200);
  })

  // POST Add a user to project (Admin only)
  .post("/:projectId/members", requireWorkspaceAdmin(), async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");
    if (!workspace?.id || !session?.tenantId) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const currentUser = ctx.get("user");
    if (!currentUser?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const projectId = ctx.req.param("projectId");

    // Ensure project belongs to active workspace (prevents cross-workspace add)
    const project = await Projects.getProjectByIdForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
      projectId,
    });
    if (!project) return ctx.json({ error: "Project not found" }, 404);

    const { userId, role } = await ctx.req.json<{
      userId: string;
      role?: "member" | "admin";
    }>();

    if (!userId) return ctx.json({ error: "userId is required" }, 400);

    await addProjectMember({
      projectId,
      userId,
      role: role ?? "member",
      actorId: currentUser.id,
    });

    return ctx.json({ success: true }, 200);
  })

  .post(
    "/:projectId/members/by-email",
    requireWorkspaceAdmin(),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const currentUser = ctx.get("user");
      if (!currentUser?.id) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const projectId = ctx.req.param("projectId");

      // Ensure project belongs to active workspace
      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });
      if (!project) return ctx.json({ error: "Project not found" }, 404);

      const { email, role } = await ctx.req.json<{
        email: string;
        role?: "member" | "admin";
      }>();

      const normalizedEmail = email?.trim().toLowerCase();
      if (!normalizedEmail)
        return ctx.json({ error: "email is required" }, 400);

      const user = await Users.getUserByEmailInTenant({
        tenantId: session.tenantId,
        email: normalizedEmail,
      });
      if (!user) return ctx.json({ error: "User not found" }, 404);

      await addProjectMember({
        projectId,
        userId: user.id,
        role: role ?? "member",
        actorId: currentUser.id,
      });

      return ctx.json({ success: true }, 200);
    },
  )

  // PUT update project
  .put("/:projectId", requireProjectAdmin("projectId"), async (ctx) => {
    const workspace = ctx.get("workspace");
    if (!workspace?.id) return ctx.json({ error: "Forbidden" }, 403);

    const user = ctx.get("user");
    if (!user?.id) return ctx.json({ error: "Unauthorized" }, 401);

    const projectId = ctx.req.param("projectId");
    const { name, description, status, notificationsEnabled, isPublic } =
      await ctx.req.json<{
        name?: string;
        description?: string;
        status?: "development" | "live";
        notificationsEnabled?: boolean;
        isPublic?: boolean;
      }>();

    const updated = await Projects.updateProjectForWorkspace(
      projectId,
      workspace.id,
      user.id,
      {
        name,
        description:
          description === undefined ? undefined : (description ?? null),
        status,
        notificationsEnabled,
        isPublic,
      },
    );

    if (!updated) return ctx.json({ error: "Project not found" }, 404);
    return ctx.json({ message: "Project updated", success: true }, 200);
  })

  // DELETE project
  .delete("/:projectId", requireProjectAdmin("projectId"), async (ctx) => {
    const workspace = ctx.get("workspace");
    if (!workspace?.id) return ctx.json({ error: "Forbidden" }, 403);

    const user = ctx.get("user");
    if (!user?.id) return ctx.json({ error: "Unauthorized" }, 401);

    const projectId = ctx.req.param("projectId");
    const ok = await Projects.deleteProjectForWorkspace(
      projectId,
      workspace.id,
      user.id,
    );

    if (!ok) return ctx.json({ error: "Project not found" }, 404);
    return ctx.json({ message: "Project deleted", success: true }, 200);
  })

  .delete(
    "/:projectId/members/:userId",
    requireWorkspaceAdmin(),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const user = ctx.get("user");
      if (!user?.id) return ctx.json({ error: "Unauthorized" }, 401);

      const projectId = ctx.req.param("projectId");

      // Ensure project belongs to active workspace
      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });
      if (!project) return ctx.json({ error: "Project not found" }, 404);

      const userId = ctx.req.param("userId");

      const members = await getMembersForProject(projectId);

      const memberToRemove = members.find((m) => m.userId === userId);
      if (!memberToRemove) {
        return ctx.json({ error: "Member not found" }, 404);
      }

      const adminCount = members.filter((m) => m.role === "admin").length;

      if (memberToRemove.role === "admin" && adminCount <= 1) {
        return ctx.json(
          { error: "Count remove the last admin from a project" },
          400,
        );
      }

      await removeProjectMember({
        projectId,
        userId,
        actorId: user.id,
      });

      return ctx.json({ success: true }, 200);
    },
  )

  .delete(
    "/:projectId/members/by-email/:email",
    requireWorkspaceAdmin(),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const currentUser = ctx.get("user");
      if (!currentUser?.id) {
        return ctx.json({ error: "Unauthorized" }, 401);
      }

      const projectId = ctx.req.param("projectId");

      // Ensure project belongs to active workspace
      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });
      if (!project) return ctx.json({ error: "Project not found" }, 404);

      const email = ctx.req.param("email")?.trim().toLowerCase();
      if (!email) return ctx.json({ error: "email is required" }, 400);

      const user = await Users.getUserByEmailInTenant({
        tenantId: session.tenantId,
        email,
      });
      if (!user) return ctx.json({ error: "User not found" }, 404);

      await removeProjectMember({
        projectId,
        userId: user.id,
        actorId: currentUser.id,
      });
      return ctx.json({ success: true }, 200);
    },
  );
