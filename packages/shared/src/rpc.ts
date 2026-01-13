// packages/shared/src/rpc.ts
import { hc } from "hono/client";
import type { Hono } from "hono";

type AnyHono = Hono<any, any, any>;

export type RpcClient<App extends AnyHono> = ReturnType<typeof hc<App>>;

export function createRpcClient<App extends AnyHono>(
  ...args: Parameters<typeof hc>
): RpcClient<App> {
  return hc<App>(...args);
}
