// packages/shared/src/types/auth.ts
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Workspace {
  id: string;
  name: string;
  role: "admin" | "member";
}
