// server/src/middleware/requireWorkspace.ts
import { WorkspaceMembers, Workspaces } from "@db";
import "@shared/hono";
import type { Context, Next } from "hono";

export async function requireWorkspace(ctx: Context, next: Next) {
  const session = ctx.get("session");
  const user = ctx.get("user");

  console.log("requireWorkspace entered", {
    session: ctx.get("session"),
    user: ctx.get("user"),
    workspace: ctx.get("workspace"),
    workspaceParam: ctx.req.param("workspaceId"),
  });

  if (!session?.tenantId || !user?.id) {
    return ctx.json({ error: "Forbidden" }, 403);
  }

  const existingWorkspace = ctx.get("workspace");
  if (existingWorkspace?.id) {
    await next();
    return;
  }

  const tenantId = session.tenantId;

  const workspaceId = ctx.req.param("workspaceId") || session.workspaceId;
  if (!workspaceId) {
    return ctx.json({ error: "Workspace not selected" }, 409);
  }

  // Ensure workspace exists and belongs to tenant
  const workspaceRow = await Workspaces.getWorkspaceById({
    tenantId,
    workspaceId,
  });
  if (!workspaceRow) return ctx.json({ error: "Workspace not found" }, 404);

  console.log("requireWorkspace", {
    tenantId,
    userId: user.id,
    workspaceId,
    sessionWorkspaceId: session.workspaceId,
  });

  // Ensure membership (membership table is indirectly tenant-scoped via workspaceId)
  const membership = await WorkspaceMembers.getWorkspaceMembershipForTenant({
    tenantId,
    userId: user.id,
    workspaceId,
  });

  console.log("workspace membership", membership);

  if (!membership) return ctx.json({ error: "Forbidden" }, 403);

  // Keep ctx workspace in sync (name from DB, role from membership)
  ctx.set("workspace", {
    id: workspaceRow.id,
    tenantId: workspaceRow.tenantId,
    name: workspaceRow.name,
    role: membership.role,
  });

  ctx.set("workspaceMember", {
    workspaceId: membership.workspaceId,
    role: membership.role,
  });

  await next();
}
