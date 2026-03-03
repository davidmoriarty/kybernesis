// client/src/lib/parseOrThrow.ts
import { rpcErrorFromResponse } from "./rpcError";
export async function parseOrThrow(res, fallback) {
  let body;
  try {
    body = await res.clone().json();
  } catch {
    body = undefined;
  }
  if (!res.ok) throw rpcErrorFromResponse(res, body);
  return body ?? fallback;
}
