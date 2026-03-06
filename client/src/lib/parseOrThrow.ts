// client/src/lib/parseOrThrow.ts
import { rpcErrorFromResponse } from "./rpcError";

export async function parseOrThrow<T>(res: Response, fallback?: T): Promise<T> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 422) {
      return body as T;
    }

    throw rpcErrorFromResponse(res, body);
  }

  return (body ?? fallback) as T;
}
