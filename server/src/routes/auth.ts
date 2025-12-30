// server/src/routes/auth.ts
import { loginHandler } from "@packages/auth/login";
import { logoutHandler } from "@packages/auth/logout";
import { Hono } from "hono";

export const authRoutes = new Hono();

authRoutes.post("/login", loginHandler);
authRoutes.post("/logout", logoutHandler);
