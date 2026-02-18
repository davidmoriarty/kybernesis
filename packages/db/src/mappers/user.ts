// packages/db/src/mappers/user.ts
import type { User } from "@shared";
import type { UserRow } from "../types";

export function mapUserRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    nickname: row.nickname ?? undefined,
    timezone: row.timezone ?? undefined,
    location: row.location ?? undefined,
    avatar: row.avatar ?? undefined,
  };
}
