// packages/db/src/seed.ts
import { hashPassword } from "@shared";
import { eq } from "drizzle-orm";
import { db, Users, WorkspaceMembers, Workspaces } from "./index";

async function getOrCreateAdminUser() {
  let user = db
    .select()
    .from(Users.users)
    .where(eq(Users.users.email, "admin@example.com"))
    .get();

  if (!user) {
    const passwordHash = await hashPassword("password123");

    db.insert(Users.users)
      .values({ email: "admin@example.com", passwordHash })
      .run();

    user = db
      .select()
      .from(Users.users)
      .where(eq(Users.users.email, "admin@example.com"))
      .get();
  }

  if (!user) throw new Error("Failed to seed admin user");
  return user;
}

function getOrCreateWorkspace(ownerId: number) {
  let workspace = db
    .select()
    .from(Workspaces.workspaces)
    .where(eq(Workspaces.workspaces.name, "Demo Workspace"))
    .get();

  if (!workspace) {
    db.insert(Workspaces.workspaces)
      .values({ name: "Demo Workspace", ownerId })
      .run();

    workspace = db
      .select()
      .from(Workspaces.workspaces)
      .where(eq(Workspaces.workspaces.name, "Demo Workspace"))
      .get();
  }

  if (!workspace) throw new Error("Failed to seed workspace");
  return workspace;
}

function ensureMembership(userId: number, workspaceId: number) {
  const membership = db
    .select()
    .from(WorkspaceMembers.workspaceMembers)
    .where(eq(WorkspaceMembers.workspaceMembers.userId, userId))
    .get();

  if (!membership) {
    db.insert(WorkspaceMembers.workspaceMembers)
      .values({
        userId,
        workspaceId,
        role: "admin",
      })
      .run();
  }

  return membership;
}

async function seed() {
  const user = await getOrCreateAdminUser();
  const workspace = getOrCreateWorkspace(user.id);
  const membership = ensureMembership(user.id, workspace.id);

  console.log("Seed complete");
  console.log("User:", user);
  console.log("Workspace:", workspace);
  console.log("Membership:", membership);
}

seed();
