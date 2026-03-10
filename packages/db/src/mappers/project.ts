// packages/db/src/mappers/project.ts
import type { Project } from "@shared";
import type { ProjectRow } from "../types";

export function mapProjectRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    description: row.description ?? null,
    status: row.status,
    notificationsEnabled: row.notificationsEnabled,
    isPublic: row.isPublic,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
