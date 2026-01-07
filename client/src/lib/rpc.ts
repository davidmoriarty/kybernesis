// client/src/lib/rpc.ts
import { hcWithType } from "@server/client";

const SERVER_URL =
  import.meta.env.MODE === "development" ? "" : import.meta.env.VITE_SERVER_URL;

export const rpc = hcWithType(SERVER_URL);
