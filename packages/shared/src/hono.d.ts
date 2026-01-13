// packages/shared/src/hono.d.ts
import "hono";

declare module "hono" {
  interface Context {
    user?: {
      id: number;
      email: string;
      name: string;
    };
    session?: {
      id: string;
      userId: number;
      workspaceId: number | null;
    };
    workspace?: {
      id: number;
      name: string;
    };
    workspaceMember?: {
      workspaceId: number;
      role: "admin" | "member";
    };
  }
}
