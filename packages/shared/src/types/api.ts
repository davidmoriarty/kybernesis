// packages/shared/src/types/api.ts
import type { User, Workspace } from "./auth";

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

export type MeResponse = {
  tenant: { id: string; slug: string | null };
  user: User;
  workspace: Workspace | null;
};

export type UpdateProfileResponse = {
  message: string;
  success: true;
  user: User;
};
