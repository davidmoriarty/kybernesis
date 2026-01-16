// middleware/requireWorkspace.ts
import { db, WorkspaceMembers, Workspaces } from "@db";
import { and, eq } from "drizzle-orm";
import type { Context, Next } from "hono";

export async function requireWorkspace(ctx: Context, next: Next) {
  if (!ctx.user || !ctx.workspace?.id) {
    return ctx.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspaceId = ctx.workspace.id;

  // Verify workspace exists (only select needed fields)
  const workspace = db
    .select({
      id: Workspaces.workspaces.id,
      name: Workspaces.workspaces.name,
    })
    .from(Workspaces.workspaces)
    .where(eq(Workspaces.workspaces.id, workspaceId))
    .get();

  if (!workspace) {
    return ctx.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Verify membership
  const membership = db
    .select()
    .from(WorkspaceMembers.workspaceMembers)
    .where(
      and(
        eq(WorkspaceMembers.workspaceMembers.userId, ctx.user.id),
        eq(WorkspaceMembers.workspaceMembers.workspaceId, workspaceId),
      ),
    )
    .get();

  if (!membership) {
    return ctx.json({ error: "Forbidden" }, { status: 403 });
  }

  // Attach workspace and role
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
