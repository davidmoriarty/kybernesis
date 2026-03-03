// packages/db/src/flows/userSignup.ts
import { and, eq } from "drizzle-orm";
import { db } from "../dbInstance";
import { sessions } from "../sessions";
import { tenantMembers } from "../tenantMembers";
import { tenants } from "../tenants";
import type { SessionRow, TenantMemberRow, UserRow } from "../types";
import { users } from "../users";
import { workspaceMembers } from "../workspaceMembers";
import { workspaces } from "../workspaces";

type WorkspaceRole = "admin" | "member";

export async function createUserInTenantWithSession(input: {
  tenantId: string;
  user: {
    name: string;
    email: string;
    passwordHash: string;
  };
  tenantRole?: Exclude<TenantMemberRow["role"], "tenant">; // default: "member"
  sessionExpiresAt: Date;

  // Workspace behavior:
  // - If workspaceId is provided: optionally add membership + set active workspace on session
  // - If not provided: session.workspaceId = null (routes can later force selection)
  workspaceId?: string | null;
  workspaceRole?: WorkspaceRole; // default based on tenantRole
  addWorkspaceMembership?: boolean; // default: true when workspaceId provided
}): Promise<{
  user: UserRow;
  session: SessionRow;
}> {
  return db.transaction(async (tx) => {
    // Ensure tenant exists (prevents foreign key errors from being “mysterious”)
    const tenantExists = (
      await tx
        .select({ id: tenants.id })
        .from(tenants)
        .where(eq(tenants.id, input.tenantId))
        .limit(1)
    )[0];
    if (!tenantExists) throw new Error("Tenant not found");

    // 1) Create user
    const user = (
      await tx
        .insert(users)
        .values({
          tenantId: input.tenantId,
          name: input.user.name,
          email: input.user.email,
          passwordHash: input.user.passwordHash,
        })
        .returning()
    )[0];
    if (!user) throw new Error("Failed to create user");

    // 2) Tenant membership (member/admin)
    const role: Exclude<TenantMemberRow["role"], "tenant"> =
      input.tenantRole ?? "member";

    const tenantMember = (
      await tx
        .insert(tenantMembers)
        .values({
          tenantId: input.tenantId,
          userId: user.id,
          role,
        })
        .returning()
    )[0];
    if (!tenantMember) throw new Error("Failed to create tenant membership");

    // 3) Optional workspace membership (only if workspaceId provided)
    const workspaceId = input.workspaceId ?? null;

    if (workspaceId && (input.addWorkspaceMembership ?? true)) {
      // Verify workspace belongs to tenant
      const ws = (
        await tx
          .select({ id: workspaces.id })
          .from(workspaces)
          .where(
            and(
              eq(workspaces.id, workspaceId),
              eq(workspaces.tenantId, input.tenantId),
            ),
          )
          .limit(1)
      )[0];
      if (!ws) throw new Error("Workspace not found for tenant");

      const wsRole: WorkspaceRole =
        input.workspaceRole ?? (role === "admin" ? "admin" : "member");

      const wm = (
        await tx
          .insert(workspaceMembers)
          .values({
            userId: user.id,
            workspaceId,
            role: wsRole,
          })
          .returning()
      )[0];
      if (!wm) throw new Error("Failed to create workspace membership");
    }

    // 4) Session
    const session = (
      await tx
        .insert(sessions)
        .values({
          tenantId: input.tenantId,
          userId: user.id,
          workspaceId,
          expiresAt: input.sessionExpiresAt,
        })
        .returning()
    )[0];
    if (!session) throw new Error("Failed to create session");

    return { user, session };
  });
}
