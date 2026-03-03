// packages/shared/src/hono.d.ts
import "hono";
import type { User } from "./index";

declare module "hono" {
  interface ContextVariableMap {
    // --- tenancy ---
    tenantSlug: string | null;
    tenantId: string | null;

    // --- auth/session ---
    user: User;
    tenantRole: "tenant" | "admin" | "member" | undefined;

    workspace: {
      id: string;
      tenantId: string;
      name: string;
      role: "admin" | "member";
    };

    session: {
      id: string;
      tenantId: string;
      userId: string;
      workspaceId: string | null;
    };

    workspaceMember: {
      workspaceId: string;
      role: "admin" | "member";
    };
  }
}
