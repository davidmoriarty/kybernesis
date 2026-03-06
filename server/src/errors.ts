// server/src/errors.ts
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

function getErrorMessage(cause: unknown): string | undefined {
  if (
    typeof cause === "object" &&
    cause !== null &&
    "message" in cause &&
    typeof (cause as { message: unknown }).message === "string"
  ) {
    return (cause as { message: string }).message;
  }
  return undefined;
}

export function httpErrorHandler(err: unknown, c: Context) {
  if (err instanceof HTTPException) {
    const message = getErrorMessage(err.cause) ?? err.message ?? "Error";
    return c.json({ error: message }, err.status);
  }

  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
}

// --- common helpers ---

export const unauthorized = () =>
  new HTTPException(401, { message: "Unauthorized" });

export const forbidden = () => new HTTPException(403, { message: "Forbidden" });

export const badRequest = (message = "Bad Request") =>
  new HTTPException(400, { message });

export const notFound = (message = "Not Found") =>
  new HTTPException(404, { message });
