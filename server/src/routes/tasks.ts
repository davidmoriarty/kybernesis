// server/src/routes/tasks.ts
import { Hono } from "hono";
import "@shared/hono";
import { Projects, Tasks } from "@db";
import { emitEvent } from "@db/events";
import { getProjectMembership } from "@db/projectMembers";
import { requireWorkspace } from "../middleware/requireWorkspace";
import { requireProjectMember } from "../middleware/rbac";

export const taskRoutes = new Hono()
  .use("*", requireWorkspace)

  // GET get project task
  .get(
    "/projects/:projectId/tasks",
    requireProjectMember("projectId"),
    async (ctx) => {
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

      const tasks = await Tasks.listTasksForProject(projectId);

      return ctx.json({ tasks }, 200);
    },
  )

  // POST create task for project
  .post(
    "/projects/:projectId/tasks",
    requireProjectMember("projectId"),
    async (ctx) => {
      const workspace = ctx.get("workspace");
      const session = ctx.get("session");
      const user = ctx.get("user");

      if (!workspace?.id || !session?.tenantId) {
        return ctx.json({ error: "Forbidden" }, 403);
      }

      if (!user?.id) {
        return ctx.json({ error: "Unauthorized" }, 401);
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

      const { title, description, assignedToUserId } = await ctx.req.json<{
        title: string;
        description?: string;
        assignedToUserId?: string | null;
      }>();

      const normalizedTitle = title?.trim();

      if (!normalizedTitle) {
        return ctx.json({ error: "Title is required" }, 400);
      }

      if (assignedToUserId) {
        const membership = await getProjectMembership({
          projectId,
          userId: assignedToUserId,
        });

        if (!membership) {
          return ctx.json(
            { error: "Assigned user must be a member of the project" },
            400,
          );
        }
      }

      const task = await Tasks.createTask({
        projectId,
        title: normalizedTitle,
        description: description === undefined ? null : (description ?? null),
        assignedToUserId: assignedToUserId ?? null,
        createdByUserId: user.id,
      });

      const hydratedTask = await Tasks.getTaskById(task.id);

      if (!hydratedTask) {
        return ctx.json({ error: "Task not found after creation" }, 500);
      }

      return ctx.json({ task: hydratedTask }, 201);
    },
  )

  // PATCH task status update
  .patch("/tasks/:taskId/status", async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!workspace?.id || !session?.tenantId) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    if (!user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const taskId = ctx.req.param("taskId");

    const scope = await Tasks.getTaskScope(taskId);
    if (!scope) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    if (scope.workspaceId !== workspace.id) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    const membership = await getProjectMembership({
      projectId: scope.projectId,
      userId: user.id,
    });

    if (!membership) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const { status } = await ctx.req.json<{
      status: "todo" | "in_progress" | "done";
    }>();

    if (!status) {
      return ctx.json({ error: "Status is required" }, 400);
    }

    if (!Tasks.isTaskStatus(status)) {
      return ctx.json({ error: "Invalid task status" }, 400);
    }

    const updated = await Tasks.updateTaskStatus({
      taskId,
      status,
    });

    if (!updated) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    const task = await Tasks.getTaskById(taskId);
    if (!task) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    await emitEvent({
      workspaceId: workspace.id,
      actorId: user.id,
      entityType: "task",
      entityId: taskId,
      eventType: status === "done" ? "task.completed" : "task.updated",
      payload: {
        projectId: scope.projectId,
        taskId,
        title: task.title,
        status: task.status,
      },
    });

    return ctx.json({ task }, 200);
  })

  // PATCH update a task
  .patch("/tasks/:taskId", async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!workspace?.id || !session?.tenantId) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    if (!user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const taskId = ctx.req.param("taskId");

    const scope = await Tasks.getTaskScope(taskId);
    if (!scope) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    if (scope.workspaceId !== workspace.id) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    const membership = await getProjectMembership({
      projectId: scope.projectId,
      userId: user.id,
    });

    if (!membership) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const { title, description, assignedToUserId } = await ctx.req.json<{
      title?: string;
      description?: string | null;
      assignedToUserId?: string | null;
    }>();

    let normalizedTitle: string | undefined;

    if (title !== undefined) {
      normalizedTitle = title.trim();
      if (!normalizedTitle) {
        return ctx.json({ error: "Title cannot be empty" }, 400);
      }
    }

    if (assignedToUserId !== undefined && assignedToUserId !== null) {
      const membership = await getProjectMembership({
        projectId: scope.projectId,
        userId: assignedToUserId,
      });

      if (!membership) {
        return ctx.json(
          { error: "Assigned user must be a member of the project" },
          400,
        );
      }
    }

    const updated = await Tasks.updateTask({
      taskId,
      title: normalizedTitle,
      description,
      assignedToUserId,
    });

    if (!updated) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    const task = await Tasks.getTaskById(taskId);

    if (!task) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    return ctx.json({ task }, 200);
  })

  // DELETE delete a task
  .delete("/tasks/:taskId", async (ctx) => {
    const workspace = ctx.get("workspace");
    const session = ctx.get("session");
    const user = ctx.get("user");

    if (!workspace?.id || !session?.tenantId) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    if (!user?.id) {
      return ctx.json({ error: "Unauthorized" }, 401);
    }

    const taskId = ctx.req.param("taskId");

    const scope = await Tasks.getTaskScope(taskId);
    if (!scope) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    if (scope.workspaceId !== workspace.id) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    const membership = await getProjectMembership({
      projectId: scope.projectId,
      userId: user.id,
    });

    if (!membership) {
      return ctx.json({ error: "Forbidden" }, 403);
    }

    const deleted = await Tasks.deleteTask(taskId);

    if (!deleted) {
      return ctx.json({ error: "Task not found" }, 404);
    }

    return ctx.json({ success: true }, 200);
  });
