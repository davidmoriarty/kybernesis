// server/src/routes/auth.ts
import { Hono } from "hono";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  updateProfileHandler,
  tenantSignupHandler,
  userSignupHandler,
} from "auth";
import { requireSession } from "../middleware/requireSession";
import { requireWorkspace } from "../middleware/requireWorkspace";
import { requireTenant } from "../middleware/requireTenant";

export const authRoutes = new Hono()
  .post("/tenant-signup", tenantSignupHandler)
  .post("/login", loginHandler)
  .post("/logout", logoutHandler)
  .post("/signup", requireTenant, userSignupHandler)

  // Usually should only require session (not workspace)
  .get("/me", requireSession, meHandler)
  .put("/me", requireSession, requireWorkspace, updateProfileHandler);
