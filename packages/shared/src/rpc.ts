// packages/shared/src/rpc.ts

import type { Hono, Schema } from "hono";

// Type for any Hono app
export type AnyHono<
  Env extends Record<string, unknown> = Record<string, never>,
  Ctx extends Schema = Schema,
  S extends string = string,
> = Hono<Env, Ctx, S>;

// Typed RPC client with helper methods
export type RpcClient = {
  $get: (path: string, options?: RequestInit) => Promise<Response>;
  $post: (
    path: string,
    options?: Omit<RequestInit, "body"> & { body?: unknown },
  ) => Promise<Response>;
  $put: (
    path: string,
    options?: Omit<RequestInit, "body"> & { body?: unknown },
  ) => Promise<Response>;
  $patch: (
    path: string,
    options?: Omit<RequestInit, "body"> & { body?: unknown },
  ) => Promise<Response>;
  $delete: (
    path: string,
    options?: Omit<RequestInit, "body"> & { body?: unknown },
  ) => Promise<Response>;
};

export function createRpcClient(baseUrl: string): RpcClient {
  return {
    $get: (path, options) =>
      fetch(`${baseUrl}${path}`, {
        method: "GET",
        credentials: "include",
        ...options,
      }),

    $post: (path, options) => {
      const { body, ...init } = options ?? {};

      const isFormData = body instanceof FormData;

      return fetch(`${baseUrl}${path}`, {
        method: "POST",
        credentials: "include",
        headers: isFormData
          ? init.headers
          : {
              "Content-Type": "application/json",
              ...(init.headers ?? {}),
            },
        body:
          body === undefined
            ? undefined
            : isFormData
              ? body
              : JSON.stringify(body),
        ...init,
      });
    },

    $put: (path, options) => {
      const { body, ...init } = options ?? {};
      return fetch(`${baseUrl}${path}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...init,
      });
    },

    $patch: (path, options) => {
      const { body, ...init } = options ?? {};
      return fetch(`${baseUrl}${path}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...init,
      });
    },

    $delete: (path, options) => {
      const { body, ...init } = options ?? {};
      return fetch(`${baseUrl}${path}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...init,
      });
    },
  };
}
