// server/src/middleware/cors.ts
import { cors } from "hono/cors";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;
const DEV_CLIENT_PORT = Number(process.env.DEV_CLIENT_PORT ?? 5173);

function isAllowedOrigin(origin: string): boolean {
  // Allow a single explicit origin if provided
  if (CLIENT_ORIGIN && origin === CLIENT_ORIGIN) return true;

  // Dev: allow http(s)://*.localhost:<port>
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    const port = Number(u.port || (u.protocol === "https:" ? 443 : 80));

    if (host === "localhost" && port === DEV_CLIENT_PORT) return true;
    if (host.endsWith(".localhost") && port === DEV_CLIENT_PORT) return true;
  } catch {
    // ignore
  }

  return false;
}

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return origin; // non-browser / same-origin
    return isAllowedOrigin(origin) ? origin : null;
  },
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});
