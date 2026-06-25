// packages/db/scripts/seed-dev.ts
import { db } from "../src/dbInstance";
import * as Tenants from "../src/tenants";
import * as Users from "../src/users";
import * as Workspaces from "../src/workspaces";
import * as WorkspaceMembers from "../src/workspaceMembers";
import { tenantMembers } from "../src/tenantMembers";
import { DEFAULT_WORKSPACE_NAME } from "../src/constants";

const TENANT_NAME = process.env.SEED_TENANT_NAME ?? "Acme";
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? "Admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "password123";

async function seedHashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getOrCreateAdminUser() {
  const existing = await Users.getUserByEmailGlobal({ email: ADMIN_EMAIL });
  if (existing) return existing;

  const passwordHash = await seedHashPassword(ADMIN_PASSWORD);

  const created = await Users.createUser({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
  });

  if (!created) throw new Error("Failed to seed admin user");
  return created;
}

async function getOrCreateTenant(input: { creatorUserId: string }) {
  const slug = slugify(TENANT_NAME);

  const existing = await Tenants.getTenantBySlug(slug);
  if (existing) return existing;

  const created = await Tenants.createTenant({
    name: TENANT_NAME,
    slug,
    creatorUserId: input.creatorUserId,
  });

  if (!created) throw new Error("Failed to seed tenant");
  return created;
}

async function ensureTenantMembership(input: {
  tenantId: string;
  userId: string;
}) {
  // tenant_members has a composite PK (tenantId, userId), so this is safe to upsert.
  const row = (
    await db
      .insert(tenantMembers)
      .values({
        tenantId: input.tenantId,
        userId: input.userId,
        role: "owner", // owner/superuser role
      })
      .onConflictDoNothing()
      .returning({
        tenantId: tenantMembers.tenantId,
        userId: tenantMembers.userId,
      })
  )[0];

  return row ?? { tenantId: input.tenantId, userId: input.userId };
}

async function getOrCreateWorkspace(input: {
  tenantId: string;
  creatorUserId: string;
}) {
  const name = DEFAULT_WORKSPACE_NAME;

  const existing = await Workspaces.getWorkspaceByName({
    tenantId: input.tenantId,
    name,
  });
  if (existing) return existing;

  const created = await Workspaces.createWorkspace({
    tenantId: input.tenantId,
    name,
    creatorUserId: input.creatorUserId,
  });

  if (!created) throw new Error("Failed to seed workspace");
  return created;
}

async function ensureWorkspaceMembership(input: {
  tenantId: string;
  userId: string;
  workspaceId: string;
}) {
  const existing = await WorkspaceMembers.getWorkspaceMembershipForTenant({
    tenantId: input.tenantId,
    userId: input.userId,
    workspaceId: input.workspaceId,
  });
  if (existing) return existing;

  const created = await WorkspaceMembers.createWorkspaceMembershipForTenant({
    tenantId: input.tenantId,
    userId: input.userId,
    workspaceId: input.workspaceId,
    role: "admin",
  });

  if (!created) throw new Error("Failed to seed membership");
  return created;
}

async function seed() {
  const user = await getOrCreateAdminUser();
  const tenant = await getOrCreateTenant({ creatorUserId: user.id });

  await ensureTenantMembership({ tenantId: tenant.id, userId: user.id });

  const workspace = await getOrCreateWorkspace({
    tenantId: tenant.id,
    creatorUserId: user.id,
  });
  const membership = await ensureWorkspaceMembership({
    tenantId: tenant.id,
    userId: user.id,
    workspaceId: workspace.id,
  });

  console.log("Seed complete");
  console.log("Tenant:", {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
  });
  console.log("User:", {
    id: user.id,
    email: user.email,
  });
  console.log("Workspace:", {
    id: workspace.id,
    tenantId: workspace.tenantId,
    name: workspace.name,
  });
  console.log("WorkspaceMembership:", membership);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
