// packages/shared/src/types/auth.ts

export interface User {
  id: string; // uuid

  email: string;
  name: string;

  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp

  nickname?: string;
  timezone?: string;
  location?: string;
  avatar?: string;

  lastSeenAt?: string | null;
}

export interface Workspace {
  id: string; // uuid
  tenantId: string; // uuid
  name: string;

  // NOTE: this is the user's role within this workspace
  role: "admin" | "member";
}
