// packages/db/src/seed.ts
import { hashPassword } from "@shared";
import { and, eq } from "drizzle-orm";
import { db, Users, WorkspaceMembers, Workspaces } from "./index";

async function getOrCreateAdminUser() {
  let user = db
    .select()
    .from(Users.users)
    .where(eq(Users.users.email, "admin@example.com"))
    .get();

  if (!user) {
    const passwordHash = await hashPassword("password123");

    // Insert user
    db.insert(Users.users)
      .values({
        email: "admin@example.com",
        passwordHash,
        name: "Admin",
      })
      .run();

    // Query back the inserted user
    user = db
      .select()
      .from(Users.users)
      .where(eq(Users.users.email, "admin@example.com"))
      .get();
  }

  if (!user) throw new Error("Failed to seed admin user");

  return user as {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    createdAt: number;
    updatedAt: number;
  };
}

function getOrCreateWorkspace(user: { id: number; name: string }) {
  let workspace = db
    .select()
    .from(Workspaces.workspaces)
    .where(eq(Workspaces.workspaces.name, `${user.name}'s Workspace`))
    .get();

  if (!workspace) {
    db.insert(Workspaces.workspaces)
      .values({ name: `${user.name}'s Workspace`, ownerId: user.id })
      .run();

    workspace = db
      .select()
      .from(Workspaces.workspaces)
      .where(eq(Workspaces.workspaces.name, `${user.name}'s Workspace`))
      .get();
  }

  if (!workspace) throw new Error("Failed to seed workspace");
  return workspace as { id: number; name: string; ownerId: number };
}

function ensureMembership(userId: number, workspaceId: number) {
  const membership = db
    .select()
    .from(WorkspaceMembers.workspaceMembers)
    .where(
      and(
        eq(WorkspaceMembers.workspaceMembers.userId, userId),
        eq(WorkspaceMembers.workspaceMembers.workspaceId, workspaceId),
      ),
    )
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
  const workspace = getOrCreateWorkspace(user);
  const membership = ensureMembership(user.id, workspace.id);

  console.log("Seed complete");
  console.log("User:", user);
  console.log("Workspace:", workspace);
  console.log("Membership:", membership);
}

seed();
