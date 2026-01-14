// client/src/lib/parseOrThrow.ts
import { rpcErrorFromResponse } from "./rpcError";

export async function parseOrThrow<T>(
  res: Response,
  fallback?: T,
): Promise<T> {
  let body: unknown;
  try {
    body = await res.clone().json();
  } catch {
    body = undefined;
  }

  if (!res.ok) throw rpcErrorFromResponse(res, body);
  return (body ?? fallback) as T;
}
