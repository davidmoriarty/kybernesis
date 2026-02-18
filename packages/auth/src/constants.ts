// packages/auth/src/constants.ts

export const SESSION_COOKIE_NAME = "session_id";
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export const sessionCookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: SESSION_TTL_MS / 1000,
};
