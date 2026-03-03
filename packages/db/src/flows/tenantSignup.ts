// packages/db/src/flows/tenantSignup.ts
import { db } from "../dbInstance";
import { sessions } from "../sessions";
import type { SessionRow, TenantRow, UserRow, WorkspaceRow } from "../types";
import { tenantMembers } from "../tenantMembers";
import { tenants } from "../tenants";
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
    // 1) Tenant
    const tenant = (
      await tx
        .insert(tenants)
        .values({
          name: input.tenantName,
          slug: input.tenantSlug,
          updatedAt: new Date(),
        })
        .returning()
    )[0];
    if (!tenant) throw new Error("Failed to create tenant");

    // 2) Owner user (scoped to tenant)
    const ownerUser = (
      await tx
        .insert(users)
        .values({
          tenantId: tenant.id,
          name: input.owner.name,
          email: input.owner.email,
          passwordHash: input.owner.passwordHash,
        })
        .returning()
    )[0];
    if (!ownerUser) throw new Error("Failed to create owner user");

    // 3) Tenant membership for owner (role = tenant)
    const tm = (
      await tx
        .insert(tenantMembers)
        .values({
          tenantId: tenant.id,
          userId: ownerUser.id,
          role: "tenant",
        })
        .returning()
    )[0];
    if (!tm) throw new Error("Failed to create tenant membership");

    // 4) Default workspace for tenant
    const defaultWorkspaceName =
      input.defaultWorkspaceName ?? "Default Workspace";
    const defaultWorkspace = (
      await tx
        .insert(workspaces)
        .values({
          tenantId: tenant.id,
          name: defaultWorkspaceName,
          ownerId: ownerUser.id,
        })
        .returning()
    )[0];
    if (!defaultWorkspace)
      throw new Error("Failed to create default workspace");

    // 5) Workspace membership for owner (admin)
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
