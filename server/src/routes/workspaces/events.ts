// server/src/routes/workspaces/events.ts
import { Hono } from "hono";
import { Events } from "db";

export const workspaceEventsRoute = new Hono();

workspaceEventsRoute.get("/:workspaceId/events", async (c) => {
  const workspaceId = c.req.param("workspaceId");

  const events = await Events.getWorkspaceFeedEvents(workspaceId);

  return c.json(events);
});
