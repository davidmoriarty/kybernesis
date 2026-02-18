// server/src/types/hono.d.ts
import "hono";
import type { User, Workspace } from "@shared";

declare module "hono" {
  interface Context {
    user?: User;

    session?: {
      id: string; // session token (uuid)
      userId: string; // uuid
      workspaceId: string | null; // uuid | null
    };

    workspace?: Workspace;

    workspaceMember?: {
      workspaceId: string; // uuid
      role: "admin" | "member";
    };
  }
}
