// packages/shared/src/types/api.ts
export type ApiResponse = {
  message: string;
  success: true;
};

export interface Project {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}
