// client/src/lib/rpcError.ts
export type RpcErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "server"
  | "unknown";

export type RpcError = {
  kind: RpcErrorKind;
  status: number;
  message: string;
  details?: unknown;
};

export function rpcErrorFromResponse(res: Response, body?: unknown): RpcError {
  switch (res.status) {
    case 401:
      return { kind: "unauthorized", status: 401, message: "Unauthorized" };
    case 403:
      return { kind: "forbidden", status: 403, message: "Forbidden" };
    case 404:
      return { kind: "not_found", status: 404, message: "Not Found" };
    case 422:
      return {
        kind: "validation",
        status: 422,
        message: "Validation Error",
        details: body,
      };
    case 500:
      return { kind: "server", status: 500, message: "Server Error" };
    default:
      return {
        kind: "unknown",
        status: res.status,
        message: "Unexpected error",
        details: body,
      };
  }
}
