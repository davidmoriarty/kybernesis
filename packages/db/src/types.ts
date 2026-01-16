// packages/db/src/types.ts

export type UserRow = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
  nickname?: string;
  timezone?: string;
  location?: string;
  avatar?: string;
};

// This represents exactly what SQLite returns (nullable fields)
export type UserRowFromDb = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  updatedAt: number;
  nickname: string | null;
  timezone: string | null;
  location: string | null;
  avatar: string | null;
};

export type ProjectRow = {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};
