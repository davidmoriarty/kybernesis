// packages/db/src/seed.ts
import * as Users from "./users";
import * as Workspaces from "./workspaces";
import * as WorkspaceMembers from "./workspaceMembers";

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_NAME = "Admin";
const ADMIN_PASSWORD = "password123";

async function seedHashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, { algorithm: "argon2id" });
}

async function getOrCreateAdminUser() {
  const existing = await Users.getUserByEmail(ADMIN_EMAIL);
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

async function getOrCreateWorkspace(user: { id: string; name: string }) {
  const name = `${user.name}'s Workspace`;

  const existing = await Workspaces.getWorkspaceByName(name);
  if (existing) return existing;

  const created = await Workspaces.createWorkspace({
    name,
    ownerId: user.id,
  });

  if (!created) throw new Error("Failed to seed workspace");
  return created;
}

async function ensureMembership(userId: string, workspaceId: string) {
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
  const user = await getOrCreateAdminUser();
  const workspace = await getOrCreateWorkspace({
    id: user.id,
    name: user.name,
  });
  const membership = await ensureMembership(user.id, workspace.id);

  console.log("Seed complete");
  console.log("User:", { id: user.id, email: user.email });
  console.log("Workspace:", { id: workspace.id, name: workspace.name });
  console.log("Membership:", membership);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
