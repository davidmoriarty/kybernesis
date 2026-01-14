// packages/shared/src/rpc.ts
import type { Hono, Schema } from "hono";

// Type for any Hono app
export type AnyHono<
  Env extends Record<string, unknown> = Record<string, never>,
  Ctx extends Schema = Schema,
  S extends string = string
> = Hono<Env, Ctx, S>;

// Typed RPC client with helper methods
export type RpcClient = {
  $get: (path: string, options?: RequestInit) => Promise<Response>;
  $post: (
    path: string,
    options?: Omit<RequestInit, "body"> & { body?: unknown }
  ) => Promise<Response>;
};

/**
 * Create a simple RPC client that wraps fetch
 * and supports $get/$post helpers.
 * Allows passing RequestInit (credentials, headers, ...)
 * per request
 * @param baseUrl
 * @returns
 */
export function createRpcClient(baseUrl: string): RpcClient {
  return {
    $get: (path, options) =>
      fetch(`${baseUrl}${path}`, {
        method: "GET",
        ...options,
      }),

    $post: (path, options) => {
      const { body, ...init } = options ?? {};

      return fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        body: body !== undefined
          ? JSON.stringify(body)
          : undefined,
        ...init,
      });
    },
  };
}
