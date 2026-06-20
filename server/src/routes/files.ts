// server/src/routes/files.ts
import { Events, Files, Projects } from "@db";
import { Hono } from "hono";
import "@shared/hono";
import { getFileViewerKind } from "@shared";
import {
  deleteStoredFile,
  readStoredFile,
  readStoredTextFile,
  saveProjectFile,
  storedFileExists,
  writeStoredTextFile,
} from "../lib/storage";
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

  .get(
    "/:projectId/files/:fileId/download",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");

      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const projectId = ctx.req.param("projectId");
      const fileId = ctx.req.param("fileId");

      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });

      if (!project) {
        return ctx.json({ error: "Project not found" }, 404);
      }

      const file = await Files.getFileById(fileId);

      if (!file || file.projectId !== projectId) {
        return ctx.json({ error: "File not found" }, 404);
      }

      const exists = await storedFileExists(file.storageKey);

      if (!exists) {
        return ctx.json({ error: "Stored file not found" }, 404);
      }

      const buffer = await readStoredFile(file.storageKey);

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": file.mimeType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${file.name.replaceAll('"', "")}"`,
        },
      });
    },
  )

  .get(
    "/:projectId/files/:fileId/open",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");

      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const projectId = ctx.req.param("projectId");
      const fileId = ctx.req.param("fileId");

      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });

      if (!project) {
        return ctx.json({ error: "Project not found" }, 404);
      }

      const file = await Files.getFileById(fileId);

      if (!file || file.projectId !== projectId) {
        return ctx.json({ error: "File not found" }, 404);
      }

      const exists = await storedFileExists(file.storageKey);

      if (!exists) {
        return ctx.json({ error: "Stored file not found" }, 404);
      }

      const buffer = await readStoredFile(file.storageKey);

      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type": file.mimeType || "application/octet-stream",
          "Content-Disposition": `inline; filename="${file.name.replaceAll('"', "")}"`,
        },
      });
    },
  )

  .get(
    "/:projectId/files/:fileId/content",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");

      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const projectId = ctx.req.param("projectId");
      const fileId = ctx.req.param("fileId");

      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });

      if (!project) {
        return ctx.json({ error: "Project not found" }, 404);
      }

      const file = await Files.getFileById(fileId);

      if (!file || file.projectId !== projectId) {
        return ctx.json({ error: "File not found" }, 404);
      }

      if (getFileViewerKind(file) !== "text") {
        return ctx.json({ error: "File is not text-editable" }, 415);
      }

      const exists = await storedFileExists(file.storageKey);

      if (!exists) {
        return ctx.json({ error: "Stored file not found" }, 404);
      }

      const content = await readStoredTextFile(file.storageKey);

      return ctx.json(
        {
          file: {
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            created_at: file.created_at,
          },
          content,
        },
        200,
      );
    },
  )

  .put(
    "/:projectId/files/:fileId/content",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      const user = ctx.get("user");

      if (!workspace?.id || !session?.tenantId || !user?.id) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const projectId = ctx.req.param("projectId");
      const fileId = ctx.req.param("fileId");

      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });

      if (!project) {
        return ctx.json({ error: "Project not found" }, 404);
      }

      const file = await Files.getFileById(fileId);

      if (!file || file.projectId !== projectId) {
        return ctx.json({ error: "File not found" }, 404);
      }

      if (getFileViewerKind(file) !== "text") {
        return ctx.json({ error: "File is not text-editable" }, 415);
      }

      const { content } = await ctx.req.json<{ content: string }>();

      if (typeof content !== "string") {
        return ctx.json({ error: "Content is required" }, 400);
      }

      await writeStoredTextFile(file.storageKey, content);

      await Events.emitEvent({
        workspaceId: workspace.id,
        actorId: user.id,
        entityType: "file",
        entityId: file.id,
        eventType: "file.updated",
        payload: {
          projectId,
          fileId: file.id,
          name: file.name,
          size: content.length,
          mimeType: file.mimeType,
        },
      });

      return ctx.json({ success: true }, 200);
    },
  )

  .put(
    "/:projectId/files/:fileId/name",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      const user = ctx.get("user");

      if (!workspace?.id || !session?.tenantId || !user?.id) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const projectId = ctx.req.param("projectId");
      const fileId = ctx.req.param("fileId");

      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });

      if (!project) {
        return ctx.json({ error: "Project not found" }, 404);
      }

      const file = await Files.getFileById(fileId);

      if (!file || file.projectId !== projectId) {
        return ctx.json({ error: "File not found" }, 404);
      }

      const { name } = await ctx.req.json<{ name: string }>();

      if (typeof name !== "string" || name.trim().length === 0) {
        return ctx.json({ error: "Name is required" }, 400);
      }

      const previousName = file.name;

      const updatedFile = await Files.updateFileNameById(fileId, name.trim());

      await Events.emitEvent({
        workspaceId: workspace.id,
        actorId: user.id,
        entityType: "file",
        entityId: file.id,
        eventType: "file.renamed",
        payload: {
          projectId,
          fileId: file.id,
          previousName,
          name: updatedFile?.name,
        },
      });

      return ctx.json(
        {
          file: updatedFile,
        },
        200,
      );
    },
  )

  .delete(
    "/:projectId/files/:fileId",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      const user = ctx.get("user");

      if (!workspace?.id || !session?.tenantId || !user?.id) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      const projectId = ctx.req.param("projectId");
      const fileId = ctx.req.param("fileId");

      const project = await Projects.getProjectByIdForTenantWorkspace({
        tenantId: session.tenantId,
        workspaceId: workspace.id,
        projectId,
      });

      if (!project) {
        return ctx.json({ error: "Project not found" }, 404);
      }

      const file = await Files.getFileById(fileId);

      if (!file || file.projectId !== projectId) {
        return ctx.json({ error: "File not found" }, 404);
      }

      await deleteStoredFile(file.storageKey);

      const deleted = await Files.deleteFileById(file.id);

      if (!deleted) {
        return ctx.json({ error: "File not found" }, 404);
      }

      await Events.emitEvent({
        workspaceId: workspace.id,
        actorId: user.id,
        entityType: "file",
        entityId: file.id,
        eventType: "file.deleted",
        payload: {
          projectId,
          fileId: file.id,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        },
      });

      return ctx.json({ success: true }, 200);
    },
  )

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

    const storageKey = await saveProjectFile({
      projectId,
      file,
    });

    const created = await Files.createFile({
      projectId,
      uploadedByUserId: user.id,
      name: file.name,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      storageKey,
    });

    await Events.emitEvent({
      workspaceId: workspace.id,
      actorId: user.id,
      entityType: "file",
      entityId: created.id,
      eventType: "file.uploaded",
      payload: {
        projectId,
        fileId: created.id,
        name: created.name,
        size: created.size,
        mimeType: created.mimeType,
      },
    });

    return ctx.json({ file: created }, 201);
  });
