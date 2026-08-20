// client/src/components/activity/ActivityFeed.tsx

import { useWorkspaceEvents } from "@/hooks/useWorkspaceEvents";
import { ActivityFeedItem } from "./ActivityFeedItem";

type ActivityFeedProps = {
  workspaceId: string;
};

export function ActivityFeed({ workspaceId }: ActivityFeedProps) {
  const { data, isLoading, error } = useWorkspaceEvents(workspaceId);

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading activity…</div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load activity feed.
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border border-dashed px-4 py-6 text-center">
        <p className="text-sm font-medium">No activity yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Project updates and member changes will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-center">
      {data.map((event) => (
        <ActivityFeedItem key={event.id} event={event} />
      ))}
    </div>
  );
}
