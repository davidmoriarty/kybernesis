// server/src/routes/files.ts
import { Hono } from "hono";
import "@shared/hono";
import { Files, Projects } from "@db";
import { requireWorkspace } from "../middleware/requireWorkspace";
import { requireProjectMember } from "../middleware/rbac";

export const fileRoutes = new Hono()
  .use("*", requireWorkspace)

  .get("/:projectId/files", requireProjectMember("projectId"), async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");

    if (!workspace?.id || !session?.tenantId) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const projectId = ctx.req.param("projectId");

    const project = await Projects.getProjectByIdForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
      projectId,
    });

    if (!project) {
      return ctx.json({ error: "Project not found" }, 404);
    }

    const files = await Files.getFilesByProjectId(projectId);

    return ctx.json({ files }, 200);
  })

  .post("/:projectId/files", requireProjectMember("projectId"), async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!workspace?.id || !session?.tenantId || !user?.id) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const projectId = ctx.req.param("projectId");

    const project = await Projects.getProjectByIdForTenantWorkspace({
      tenantId: session.tenantId,
      workspaceId: workspace.id,
      projectId,
    });

    if (!project) {
      return ctx.json({ error: "Project not found" }, 404);
    }

    const formData = await ctx.req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return ctx.json({ error: "File is required" }, 400);
    }

    // Temporary: no actual disk storage yet
    const storageKey = `${projectId}/${crypto.randomUUID()}-${file.name}`;

    const created = await Files.createFile({
      projectId,
      uploadedByUserId: user.id,
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      storageKey,
    });

    return ctx.json({ file: created }, 201);
  });
