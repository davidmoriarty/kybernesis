// client/src/lib/validation.ts

import type { ProjectValidation } from "@shared";

export function isProjectValidation(
  x: unknown,
): x is { errors: ProjectValidation["errors"] } {
  if (!x || typeof x !== "object" || !("errors" in x)) return false;
  const errors = (x as { errors?: unknown }).errors;
  return Boolean(
    errors && typeof errors === "object" && !Array.isArray(errors),
  );
}
