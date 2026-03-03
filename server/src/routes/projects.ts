// server/src/routes/projects.ts
import { Hono } from "hono";
import "@shared/hono";
import { Projects } from "@db";
import { requireWorkspace } from "../middleware/requireWorkspace";

export const projectRoutes = new Hono()
  .use("*", requireWorkspace)

  // GET all projects for active workspace
  .get("/", async (ctx) => {
    const session = ctx.get("session");
    const workspace = ctx.get("workspace");

    if (!session?.tenantId || !workspace?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const projects = await Projects.getProjectsForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
    });

    return ctx.json({ projects }, 200);
  })

  // GET single project (tenant + workspace scoped)
  .get("/:projectId", async (ctx) => {
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
  .post("/", async (ctx) => {
    const workspace = ctx.get("workspace");
    if (!workspace?.id) return ctx.json({ error: "Forbidden" }, 403);

    const { name, description } = await ctx.req.json<{
      name: string;
      description?: string;
    }>();

    if (!name) return ctx.json({ error: "Name is required" }, 400);

    const project = await Projects.createProject({
      workspaceId: workspace.id,
      name,
      description: description ?? null,
    });

    return ctx.json({ project }, 201);
  })

  // PUT update project
  .put("/:projectId", async (ctx) => {
    const workspace = ctx.get("workspace");
    if (!workspace?.id) return ctx.json({ error: "Forbidden" }, 403);

    const projectId = ctx.req.param("projectId");
    const { name, description } = await ctx.req.json<{
      name?: string;
      description?: string;
    }>();

    const updated = await Projects.updateProjectForWorkspace(
      projectId,
      workspace.id,
      {
        name,
        description:
          description === undefined ? undefined : (description ?? null),
      },
    );

    if (!updated) return ctx.json({ error: "Project not found" }, 404);
    return ctx.json({ message: "Project updated", success: true }, 200);
  })

  // DELETE project
  .delete("/:projectId", async (ctx) => {
    const workspace = ctx.get("workspace");
    if (!workspace?.id) return ctx.json({ error: "Forbidden" }, 403);

    const projectId = ctx.req.param("projectId");
    const ok = await Projects.deleteProjectForWorkspace(
      projectId,
      workspace.id,
    );

    if (!ok) return ctx.json({ error: "Project not found" }, 404);
    return ctx.json({ message: "Project deleted", success: true }, 200);
  });
