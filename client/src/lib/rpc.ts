// client/src/lib/rpc.ts
import { createRpcClient } from "@shared/rpc";

const SERVER_URL =
  import.meta.env.MODE === "development"
    ? "/api"
    : import.meta.env.VITE_SERVER_URL;

export const rpc = createRpcClient(SERVER_URL);
