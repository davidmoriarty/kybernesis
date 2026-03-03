// packages/db/scripts/seed-dev.ts
import { db } from "../src/dbInstance";
import * as Tenants from "../src/tenants";
import * as Users from "../src/users";
import * as Workspaces from "../src/workspaces";
import * as WorkspaceMembers from "../src/workspaceMembers";
import { tenantMembers } from "../src/tenantMembers";
import { DEFAULT_WORKSPACE_NAME } from "../src/constants";

const TENANT_NAME = "Acme";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_NAME = "Admin";
const ADMIN_PASSWORD = "password123";

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

async function getOrCreateTenant() {
  const slug = slugify(TENANT_NAME);

  const existing = await Tenants.getTenantBySlug(slug);
  if (existing) return existing;

  const created = await Tenants.createTenant({
    name: TENANT_NAME,
    slug,
  });

  if (!created) throw new Error("Failed to seed tenant");
  return created;
}

async function getOrCreateAdminUser(tenantId: string) {
  const existing = await Users.getUserByEmail({ tenantId, email: ADMIN_EMAIL });
  if (existing) return existing;

  const passwordHash = await seedHashPassword(ADMIN_PASSWORD);

  const created = await Users.createUser({
    tenantId,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
  });

  if (!created) throw new Error("Failed to seed admin user");
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
        role: "tenant", // owner/superuser role
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
  user: { id: string; name: string };
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
    ownerId: input.user.id,
  });

  if (!created) throw new Error("Failed to seed workspace");
  return created;
}

async function ensureWorkspaceMembership(userId: string, workspaceId: string) {
  const existing = await WorkspaceMembers.getWorkspaceMembership(
    userId,
    workspaceId,
  );
  if (existing) return existing;

  const created = await WorkspaceMembers.createWorkspaceMembership({
    userId,
    workspaceId,
    role: "admin",
  });

  if (!created) throw new Error("Failed to seed membership");
  return created;
}

async function seed() {
  const tenant = await getOrCreateTenant();
  const user = await getOrCreateAdminUser(tenant.id);

  await ensureTenantMembership({ tenantId: tenant.id, userId: user.id });

  const workspace = await getOrCreateWorkspace({
    tenantId: tenant.id,
    user: { id: user.id, name: user.name },
  });

  const membership = await ensureWorkspaceMembership(user.id, workspace.id);

  console.log("Seed complete");
  console.log("Tenant:", {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
  });
  console.log("User:", {
    id: user.id,
    tenantId: user.tenantId,
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
