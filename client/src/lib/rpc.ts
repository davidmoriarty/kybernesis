// client/src/lib/rpc.ts
import { hcWithType } from "@server/client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export const rpc = hcWithType(SERVER_URL);
