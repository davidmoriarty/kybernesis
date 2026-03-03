// server/src/app.ts
import { Hono } from "hono";
import { logger } from "hono/logger";
import "@shared/hono";

// ---- route imports ----
import { metaRoutes } from "./routes/meta";
import { tenantApi } from "./routes/tenantApi";

// ---- middleware imports ----
import { resolveTenant } from "./middleware/resolveTenant";
import { corsMiddleware } from "./middleware/cors";

export const app = new Hono()
  .use("*", logger())
  .use("*", resolveTenant)
  .use("*", corsMiddleware)
  .route("/", metaRoutes)
  .route("/api", tenantApi);
