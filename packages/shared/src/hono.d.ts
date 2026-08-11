// packages/shared/src/hono.d.ts

import "hono";
import type { Surface, User, Workspace } from "./index";

declare module "hono" {
  interface ContextVariableMap {
    // --- tenancy ---
    surface: Surface;
    tenantSlug: string | null;
    tenantId: string | null;

    // --- auth/session ---
    user: User;
    tenantRole: "owner" | "admin" | "member" | undefined;

    workspace: Workspace;

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
