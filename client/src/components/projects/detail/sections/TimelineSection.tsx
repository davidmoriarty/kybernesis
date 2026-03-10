// client/src/components/projects/detail/sections/TimelineSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TimelineSectionProps {
  events?: { date: string; event: string }[];
}

export function TimelineSection({ events }: TimelineSectionProps) {
  if (!events) {
    // show placeholders
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 flex items-center gap-4">
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

  return (
    <div className="flex flex-col gap-4">
      {events.map((e) => (
        <Card
          key={`${e.event}-${e.date}`}
          className="p-4 flex items-center gap-4"
        >
          <div className="h-6 w-6 rounded-full bg-accent" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">{e.event}</p>
            <p className="text-sm text-muted-foreground">{e.date}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
