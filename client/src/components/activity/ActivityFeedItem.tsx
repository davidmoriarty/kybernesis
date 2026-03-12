// client/src/components/activity/ActivityFeedItem.tsx
import type { WorkspaceEvent } from "@/hooks/useWorkspaceEvents";

export function ActivityFeedItem({ event }: { event: WorkspaceEvent }) {
  return (
    <div className="grid grid-cols-3 gap-4 rounded-md border px-3 py-2 text-sm">
      <div className="font-medium">{event.actorName ?? "System"}</div>
      <div className="text-muted-foreground">{formatEventLabel(event)}</div>
      <div className="text-muted-foreground">
        {formatTime(event.created_at)}
      </div>
    </div>
  );
}

function formatEventLabel(event: WorkspaceEvent) {
  const name =
    typeof event.payload.name === "string" ? event.payload.name : null;

  const email =
    typeof event.payload.email === "string" ? event.payload.email : null;

  const userId =
    typeof event.payload.userId === "string" ? event.payload.userId : null;

  const role =
    typeof event.payload.role === "string" ? event.payload.role : null;

  switch (event.eventType) {
    case "workspace.created":
      return name ? `Created workspace "${name}"` : "Created workspace";

    case "project.created":
      return name ? `Created project "${name}"` : "Created project";

    case "project.updated":
      return name ? `Updated project "${name}"` : "Updated project";

    case "project.deleted":
      return name ? `Deleted project "${name}"` : "Deleted project";

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

    default:
      return event.eventType;
  }
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
