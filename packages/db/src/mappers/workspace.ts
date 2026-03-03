// packages/db/src/mappers/workspace.ts
import type { Workspace } from "@shared";
import type { WorkspaceRowSummaryWithRole } from "../types";

export function mapWorkspaceSummaryWithRoleToWorkspace(
  row: WorkspaceRowSummaryWithRole,
): Workspace {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    role: row.role,
  };
}
