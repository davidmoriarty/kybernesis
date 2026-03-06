// client/src/lib/rpcError.ts
export type RpcErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "server"
  | "unknown";

export class RpcError extends Error {
  kind: RpcErrorKind;
  status: number;
  message: string;
  details?: unknown;

  constructor(
    kind: RpcErrorKind,
    status: number,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.kind = kind;
    this.status = status;
    this.message = message;
    this.details = details;
  }
}

export function rpcErrorFromResponse(res: Response, body?: unknown): RpcError {
  switch (res.status) {
    case 401:
      return new RpcError("unauthorized", 401, "Unauthorized", body);

    case 403:
      return new RpcError("forbidden", 403, "Forbidden", body);

    case 404:
      return new RpcError("not_found", 404, "Not Found", body);

    case 422:
      return new RpcError("validation", 422, "Validation Error", body);

    case 500:
      return new RpcError("server", 500, "Server Error", body);

    default:
      return new RpcError("unknown", res.status, "Unexpected error", body);
  }
}

export function isRpcError(err: unknown): err is RpcError {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
  );
}
