// packages/db/src/mappers/user.ts
import type { User } from "@shared";
import type { UserRow, UserRowFromDb } from "../types";

export function mapUserRowToUser(row: UserRowFromDb | UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    nickname: row.nickname ?? undefined,
    timezone: row.timezone ?? undefined,
    location: row.location ?? undefined,
    avatar: row.avatar ?? undefined,
  };
}

export function normalizeUserRow(row: UserRowFromDb): UserRow {
  return {
    ...row,
    nickname: row.nickname ?? undefined,
    timezone: row.timezone ?? undefined,
    location: row.location ?? undefined,
    avatar: row.avatar ?? undefined,
  };
}
