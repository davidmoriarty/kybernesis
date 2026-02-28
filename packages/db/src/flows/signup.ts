// packages/db/src/flows/signup.ts
import { db } from "../dbInstance";
import { sessions } from "../sessions";
import type { SessionRow } from "../types";
import { users } from "../users";
import { workspaceMembers } from "../workspaceMembers";
import { workspaces } from "../workspaces";

// ----- Workflow: create user + workspace + membership + session -----

export async function createUserWithWorkspaceAndSession(input: {
  name: string;
  email: string;
  passwordHash: string;
  sessionExpiresAt: Date;
}): Promise<{ session: SessionRow }> {
  return db.transaction(async (tx) => {
    const user = (
      await tx
        .insert(users)
        .values({
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
        })
        .returning()
    )[0];
    if (!user) throw new Error("Failed to create user");

    const workspace = (
      await tx
        .insert(workspaces)
        .values({
          name: `${input.name}'s Workspace`,
          ownerId: user.id,
        })
        .returning()
    )[0];
    if (!workspace) throw new Error("Failed to create workspace");

    await tx.insert(workspaceMembers).values({
      userId: user.id,
      workspaceId: workspace.id,
      role: "admin",
    });

    const session = (
      await tx
        .insert(sessions)
        .values({
          userId: user.id,
          workspaceId: workspace.id,
          expiresAt: input.sessionExpiresAt,
        })
        .returning()
    )[0];
    if (!session) throw new Error("Failed to create session");

    return { session };
  });
}
