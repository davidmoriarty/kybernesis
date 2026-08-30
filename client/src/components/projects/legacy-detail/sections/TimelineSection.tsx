// client/src/components/projects/detail/sections/TimelineSection.tsx

import { EmptyState } from "@/components/shared";
import {
  formatTimelineEvent,
  type TimelineEvent,
} from "@/components/projects/legacy-detail/sections/timeline/formatTimelineEvents";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/timeAgo";

interface TimelineSectionProps {
  events?: TimelineEvent[];
}

export function TimelineSection({ events }: TimelineSectionProps) {
  if (!events) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-6 w-6 rounded-full" />

            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return <EmptyState message="No timeline events yet." />;
  }

  return (
    <div className="relative flex flex-col gap-4">
      <div className="absolute top-0 bottom-0 left-9 w-px bg-border" />

      {events.map((event) => {
        const parts = formatTimelineEvent(event);

        return (
          <Card
            key={event.id}
            className="p-4 pl-8 transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative flex flex-row items-center justify-start gap-4">
              <div className="relative z-10 h-2 w-2 shrink-0 rounded-full bg-primary" />

              <div className="flex min-w-0 flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">
                    <span>{parts.actor} </span>

                    <span className="text-muted-foreground">
                      {parts.action}{" "}
                    </span>

                    {parts.subject ? (
                      <span className="font-semibold text-foreground">
                        "{parts.subject}"
                      </span>
                    ) : null}
                  </p>
                </div>

                <p
                  className="text-sm text-muted-foreground sm:shrink-0 sm:text-right"
                  title={new Date(event.created_at).toLocaleString()}
                >
                  {timeAgo(event.created_at)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
