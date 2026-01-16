// server/src/types/hono.d.ts
import "hono";

declare module "hono" {
  interface Context {
    user?: {
      id: number;
      email: string;
      name: string;
      createdAt: number;
      updatedAt: number;
      nickname?: string;
      timezone?: string;
      location?: string;
      avatar?: string;
    };
    session?: {
      id: string;
      userId: number;
      workspaceId: number | null;
    };
    workspace?: {
      id: number;
      name: string;
      role: "admin" | "member";
    };
    workspaceMember?: {
      workspaceId: number;
      role: "admin" | "member";
    };
  }
}
