// server/src/routes/meta.ts

import { Hono } from "hono";

const startedAtMs = Date.now();

export const metaRoutes = new Hono()
  .get("/", (c) => {
    return c.json({
      name: "kybernesis-api",
      version: process.env.APP_VERSION ?? "dev",
      status: "ok",
      documentation: null,
    });
  })
  .get("/__info", (c) => {
    const uptimeSeconds = Math.floor((Date.now() - startedAtMs) / 1000);
    return c.json({
      name: "kybernesis-api",
      nodeEnv: process.env.NODE_ENV ?? "dev",
      uptimeSeconds,
      clientOrigin: process.env.CLIENT_ORIGIN ?? null,
    });
  })
  .get("/debug/tenant", (ctx) => {
    return ctx.json({
      host: ctx.req.header("host") ?? null,
      surface: ctx.get("surface"),
      tenantSlug: ctx.get("tenantSlug"),
      tenantId: ctx.get("tenantId"),
      path: ctx.req.path,
    });
  })
  .get("/tenant-context", (ctx) => {
    return ctx.json({
      surface: ctx.get("surface"),
      tenantSlug: ctx.get("tenantSlug"),
      tenantId: ctx.get("tenantId"),
    });
  });
