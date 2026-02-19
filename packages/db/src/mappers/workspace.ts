// packages/db/src/mappers/workspace.ts
import type { Workspace } from "@shared/types/auth";
import type { WorkspaceSummaryWithRole } from "../types";

export function mapWorkspaceSummaryWithRoleToWorkspace(
  row: WorkspaceSummaryWithRole,
): Workspace {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
  };
}
