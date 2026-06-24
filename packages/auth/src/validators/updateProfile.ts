// packages/auth/src/validators/updateProfile.ts
import type { UpdateUserProfileInput } from "shared";

export function isUpdateUserProfileInput(
  value: unknown,
): value is UpdateUserProfileInput {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;

  if (v.name !== undefined && typeof v.name !== "string") return false;
  if (v.email !== undefined && typeof v.email !== "string") return false;

  if (
    v.nickname !== undefined &&
    v.nickname !== null &&
    typeof v.nickname !== "string"
  ) {
    return false;
  }

  if (
    v.timezone !== undefined &&
    v.timezone !== null &&
    typeof v.timezone !== "string"
  ) {
    return false;
  }

  if (
    v.location !== undefined &&
    v.location !== null &&
    typeof v.location !== "string"
  ) {
    return false;
  }

  if (
    v.avatar !== undefined &&
    v.avatar !== null &&
    typeof v.avatar !== "string"
  ) {
    return false;
  }

  return true;
}
