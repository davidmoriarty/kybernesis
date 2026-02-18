// packages/shared/src/types/api.ts
export type ApiResponse = {
  message: string;
  success: true;
};

export interface Project {
  id: string; // uuid
  workspaceId: string; // uuid
  name: string;
  description?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}
