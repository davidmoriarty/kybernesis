// packages/auth/src/signup.ts
import { Flows, Users } from "@db";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { hashPassword } from "./crypto/password";
import type { SignupInput } from "./types";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_MS,
  sessionCookieOptions,
} from "./constants";

export async function signupHandler(ctx: Context): Promise<Response> {
  const { name, email, password } = (await ctx.req.json()) as SignupInput;

  if (!name || !email || !password) {
    return ctx.json({ error: "Name, email, and password are required" }, 400);
  }

  const existingUser = await Users.getUserByEmail(email);
  if (existingUser) return ctx.json({ error: "User already exists" }, 409);

  const passwordHash = await hashPassword(password);

  const { session } = await Flows.createUserWithWorkspaceAndSession({
    name,
    email,
    passwordHash,
    sessionExpiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });

  setCookie(ctx, SESSION_COOKIE_NAME, session.id, sessionCookieOptions);

  return ctx.json({ message: "Account created", success: true }, 201);
}
