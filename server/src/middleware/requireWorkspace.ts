import { WorkspaceMembers, Workspaces } from "@db";
import type {} from "@shared/hono";
import type { Context, Next } from "hono";

export async function requireWorkspace(ctx: Context, next: Next) {
  if (!ctx.user || !ctx.workspace?.id) {
    return ctx.json({ error: "Forbidden" }, 403);
  }

  const workspaceId = ctx.workspace.id;

  const workspace = await Workspaces.getWorkspaceById(workspaceId);
  if (!workspace) return ctx.json({ error: "Workspace not found" }, 404);

  const membership = await WorkspaceMembers.getWorkspaceMembership(
    ctx.user.id,
    workspaceId,
  );
  if (!membership) return ctx.json({ error: "Forbidden" }, 403);

  ctx.workspace = {
    id: workspace.id,
    name: workspace.name,
    role: membership.role,
  };

  ctx.workspaceMember = {
    workspaceId: membership.workspaceId,
    role: membership.role,
  };

  await next();
}
