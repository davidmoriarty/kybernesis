// client/src/components/activity/ActivityFeedItem.tsx

import type { WorkspaceEvent } from "@/hooks/useWorkspaceEvents";

export function ActivityFeedItem({ event }: { event: WorkspaceEvent }) {
  return (
    <div className="rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/30">
      <div className="flex items-center justify-between gap-4 md:hidden">
        <div className="truncate font-medium">
          {event.actorName ?? "System"}
        </div>

        <div className="shrink-0 text-xs text-muted-foreground">
          {formatTime(event.created_at)}
        </div>
      </div>

      <div className="mt-1 text-left text-muted-foreground md:hidden">
        {formatEventLabel(event)}
      </div>

      <div className="hidden md:grid md:grid-cols-[140px_minmax(0,1fr)_88px] md:items-center md:gap-4">
        <div className="truncate font-medium">
          {event.actorName ?? "System"}
        </div>

        <div className="min-w-0 text-muted-foreground">
          {formatEventLabel(event)}
        </div>

        <div className="text-right text-muted-foreground">
          {formatTime(event.created_at)}
        </div>
      </div>
    </div>
  );
}

function formatEventLabel(event: WorkspaceEvent) {
  const name = getPayloadString(event, "name");
  const email = getPayloadString(event, "email");
  const userId = getPayloadString(event, "userId");
  const role = getPayloadString(event, "role");

  switch (event.eventType) {
    case "workspace.created":
      return quoteLabel("Created workspace", name);

    case "workspace.updated":
      return quoteLabel("Updated workspace", name);

    case "member.added":
      return email
        ? `Added ${email}${role ? ` as ${role}` : ""}`
        : userId
          ? `Added member ${userId}${role ? ` as ${role}` : ""}`
          : "Added member";

    case "member.removed":
      return email
        ? `Removed ${email}`
        : userId
          ? `Removed member ${userId}`
          : "Removed member";

    case "member.role_updated":
      return email
        ? `Changed ${email} to ${role ?? "member"}`
        : userId
          ? `Changed member ${userId} to ${role ?? "member"}`
          : "Updated member role";

    case "project.created":
      return quoteLabel("Created project", name);

    case "project.updated":
      return quoteLabel("Updated project", name);

    case "project.archived":
      return quoteLabel("Archived project", name);

    case "project.deleted":
      return quoteLabel("Deleted project", name);

    default:
      return event.eventType;
  }
}

function getPayloadString(event: WorkspaceEvent, key: string): string | null {
  const value = event.payload[key];
  return typeof value === "string" ? value : null;
}

function quoteLabel(prefix: string, value: string | null) {
  return value ? `${prefix} "${value}"` : prefix;
}

function formatTime(iso: string): string {
  const last = new Date(iso).getTime();
  const diffMs = Date.now() - last;
  const mins = Math.max(0, Math.floor(diffMs / 60_000));

  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;

  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hr ago";
  if (hours < 24) return `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
