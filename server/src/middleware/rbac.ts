// server/src/middleware/rbac.ts
import type { MiddlewareHandler, Context } from "hono";
import { forbidden, unauthorized, badRequest, notFound } from "../errors";
import type {} from "shared/hono";
import { getWorkspaceRoleForUser } from "db/workspaceMembers";
import {
  getProjectRoleForUser,
  getProjectWorkspaceId,
} from "db/projectMembers";

function getTenantId(c: Context): string {
  const tenantId = c.get("tenantId");
  if (!tenantId) throw badRequest();
  return tenantId;
}

function getUserId(c: Context): string {
  const user = c.get("user");
  const userId = user?.id;
  if (!userId) throw unauthorized();
  return userId;
}

function resolveWorkspaceId(
  c: Context,
  workspaceIdParam = "workspaceId",
): string {
  const fromReq =
    c.req.param(workspaceIdParam) ?? c.req.query(workspaceIdParam);
  if (fromReq) return fromReq;

  const workspace = c.get("workspace");
  if (workspace?.id) return workspace.id;

  throw badRequest();
}

export const requireWorkspaceMember =
  (workspaceIdParam = "workspaceId"): MiddlewareHandler =>
  async (c, next) => {
    const tenantId = getTenantId(c);
    const userId = getUserId(c);
    const workspaceId = resolveWorkspaceId(c, workspaceIdParam);

    const role = await getWorkspaceRoleForUser({
      tenantId,
      userId,
      workspaceId,
    });
    if (!role) throw forbidden();

    c.set("workspaceId", workspaceId);
    c.set("workspaceRole", role); // "admin" | "member" | etc
    await next();
  };

export const requireWorkspaceAdmin =
  (workspaceIdParam = "workspaceId"): MiddlewareHandler =>
  async (c, next) => {
    await requireWorkspaceMember(workspaceIdParam)(c, async () => {});
    const role = c.get("workspaceRole");
    if (role !== "admin") throw forbidden();
    await next();
  };

export const requireProjectMember =
  (projectIdParam = "id"): MiddlewareHandler =>
  async (c, next) => {
    const tenantId = getTenantId(c);
    const userId = getUserId(c);

    const projectId = c.req.param(projectIdParam);
    if (!projectId) throw badRequest();

    const workspaceId = await getProjectWorkspaceId({ projectId });
    if (!workspaceId) throw notFound();

    const wsRole = await getWorkspaceRoleForUser({
      tenantId,
      userId,
      workspaceId,
    });
    if (wsRole === "admin") {
      c.set("workspaceId", workspaceId);
      c.set("workspaceRole", wsRole);
      c.set("projectId", projectId);
      c.set("projectRole", "admin"); // implied
      return next();
    }

    const projRole = await getProjectRoleForUser({ userId, projectId });
    if (!projRole) throw forbidden();

    c.set("workspaceId", workspaceId);
    c.set("workspaceRole", wsRole ?? null);
    c.set("projectId", projectId);
    c.set("projectRole", projRole);
    await next();
  };

export const requireProjectAdmin =
  (projectIdParam = "id"): MiddlewareHandler =>
  async (c, next) => {
    await requireProjectMember(projectIdParam)(c, async () => {});
    const wsRole = c.get("workspaceRole");
    if (wsRole === "admin") return next();

    const projRole = c.get("projectRole");
    if (projRole !== "admin") throw forbidden();

    await next();
  };
