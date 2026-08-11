// server/src/app.ts

import { Hono } from "hono";
import { logger } from "hono/logger";
import { httpErrorHandler } from "./errors";
import type {} from "shared/hono";

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
  .get("/_info", (ctx) =>
    ctx.json({
      name: "kybernesis-server",
      status: "ok",
      environment: process.env.NODE_ENV ?? "development",
      storageDriver: process.env.STORAGE_DRIVER ?? "local",
    }),
  )
  .route("/", metaRoutes)
  .route("/api", tenantApi)
  .onError(httpErrorHandler);
