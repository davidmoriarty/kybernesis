// packages/db/src/mappers/project.ts
import type { Project } from "@shared";
import type { ProjectRow } from "../types";

export function mapProjectRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
