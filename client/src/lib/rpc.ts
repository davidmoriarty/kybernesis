// client/src/lib/rpc.ts
import type { app } from "@server/index";
import { createRpcClient } from "@shared/rpc";

type AppType = typeof app;

const SERVER_URL =
  import.meta.env.MODE === "development"
  ? ""
  : import.meta.env.VITE_SERVER_URL;

export const rpc = createRpcClient<AppType>(SERVER_URL);
