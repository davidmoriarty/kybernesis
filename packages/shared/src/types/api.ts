// packages/shared/src/types/api.ts

import type { User, Workspace } from "./auth";

export type ApiResponse = {
  message: string;
  success: true;
};

export type ProjectStatus = "development" | "live";

export interface Project {
  id: string; // uuid
  workspaceId: string; // uuid
  name: string;
  description: string | null;
  status: ProjectStatus;
  notificationsEnabled: boolean;
  isPublic: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type ProjectValidation = {
  errors: Partial<Record<"name" | "description" | "workspaceId", string>>;
};

export type MeResponse = {
  tenant: { id: string; slug: string | null };
  tenantRole: "owner" | "admin" | "member";
  user: User;
  workspace: Workspace | null;
};

export type UpdateProfileResponse = {
  message: string;
  success: true;
  user: User;
};

export type UpdateUserProfileInput = Partial<{
  name: string;
  email: string;
  nickname: string | null;
  timezone: string | null;
  location: string | null;
  avatar: string | null;
}>;
