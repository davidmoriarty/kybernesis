// server/src/types/hono.d.ts
import "hono";

declare module "hono" {
  interface Context {
    user?: {
      id: number;
      email: string;
    };
    session?: {
      id: string;
      userId: number;
      workspaceId: number | null;
    };
    workspace?: {
      id: string;
      name: string;
      role: "admin" | "member";
    };
  }
}
