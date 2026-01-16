// packages/shared/src/types/auth.ts
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  nickname?: string;
  timezone?: string;
  location?: string;
  avatar?: string;
}

export interface Workspace {
  id: number;
  name: string;
  role: "admin" | "member";
}
