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
}

export interface Workspace {
  id: string; // uuid
  name: string;
  role: "admin" | "member";
}
