// server/src/index.ts
import { app } from "./app";

const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});

console.log(`API listening on http://0.0.0.0:${port}`);
