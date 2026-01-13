// packages/auth/src/me.ts
import type {} from "@shared/hono";
import type { Context } from "hono";

export async function meHandler(ctx: Context) {
  return ctx.json({
    user: ctx.user,
    workspace: ctx.workspace,
  });
}
