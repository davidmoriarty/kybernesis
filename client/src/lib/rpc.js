// client/src/lib/rpc.ts
import { createRpcClient } from "@shared/rpc";
function getDevApiBaseUrl() {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}:3000/api`;
}
const SERVER_URL =
  import.meta.env.MODE === "development"
    ? getDevApiBaseUrl()
    : import.meta.env.VITE_API_URL;
if (!SERVER_URL) {
  throw new Error("VITE_API_URL is not set (production build).");
}
export const rpc = createRpcClient(SERVER_URL);
