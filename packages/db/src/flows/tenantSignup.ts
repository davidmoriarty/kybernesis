// packages/db/src/flows/tenantSignup.ts
import { db } from "../dbInstance";
import { sessions } from "../sessions";
import type { SessionRow, TenantRow, UserRow, WorkspaceRow } from "../types";
import { createTenantTx } from "../tenants";
import { users } from "../users";
import { workspaceMembers } from "../workspaceMembers";
import { workspaces } from "../workspaces";

export async function createTenantWithOwnerAndSession(input: {
  tenantName: string;
  tenantSlug: string;
  owner: {
    name: string;
    email: string;
    passwordHash: string;
  };
  sessionExpiresAt: Date;

  // Defaults (optional)
  defaultWorkspaceName?: string; // default: "Default Workspace"
}): Promise<{
  tenant: TenantRow;
  ownerUser: UserRow;
  session: SessionRow;
  defaultWorkspace: WorkspaceRow;
}> {
  return db.transaction(async (tx) => {
    // 1) Owner user (global)
    const ownerUser = (
      await tx
        .insert(users)
        .values({
          name: input.owner.name,
          email: input.owner.email,
          passwordHash: input.owner.passwordHash,
        })
        .returning()
    )[0];
    if (!ownerUser) throw new Error("Failed to create owner user");

    // 2) Tenant + owner membership (atomic via helper)
    const tenant = await createTenantTx(tx, {
      name: input.tenantName,
      slug: input.tenantSlug,
      creatorUserId: ownerUser.id,
    });

    // 3) Default workspace for tenant
    const defaultWorkspaceName =
      input.defaultWorkspaceName ?? "Default Workspace";
    const defaultWorkspace = (
      await tx
        .insert(workspaces)
        .values({
          tenantId: tenant.id,
          name: defaultWorkspaceName,
        })
        .returning()
    )[0];
    if (!defaultWorkspace)
      throw new Error("Failed to create default workspace");

    // 4) Workspace membership for owner (admin)
    const wm = (
      await tx
        .insert(workspaceMembers)
        .values({
          userId: ownerUser.id,
          workspaceId: defaultWorkspace.id,
          role: "admin",
        })
        .returning()
    )[0];
    if (!wm) throw new Error("Failed to create workspace membership");

    // 6) Session (scoped to tenant)
    const session = (
      await tx
        .insert(sessions)
        .values({
          tenantId: tenant.id,
          userId: ownerUser.id,
          workspaceId: defaultWorkspace.id,
          expiresAt: input.sessionExpiresAt,
        })
        .returning()
    )[0];
    if (!session) throw new Error("Failed to create session");

    return { tenant, ownerUser, session, defaultWorkspace };
  });
}
