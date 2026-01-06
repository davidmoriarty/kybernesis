// middleware/requireWorkspace.ts
import { db, WorkspaceMembers, Workspaces } from "@db";
import { and, eq } from "drizzle-orm";
import type { Context, Next } from "hono";

export async function requireWorkspace(ctx: Context, next: Next) {
  // Must have a user and workspace context
  if (!ctx.user || !ctx.workspace?.id) {
    return ctx.json({ error: "Forbidden" }, { status: 403 });
  }

  const workspaceId = Number(ctx.workspace.id);

  // Verify workspace exists
  const workspace = db
    .select()
    .from(Workspaces.workspaces)
    .where(eq(Workspaces.workspaces.id, workspaceId))
    .get();

  if (!workspace) {
    return ctx.json({ error: "Workspace not found" }, { status: 404 });
  }

  // Verify membership + role
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

  // Attach workspace context
  ctx.workspace = {
    id: String(workspace.id),
    name: workspace.name,
    role: membership.role,
  };

  await next();
}
