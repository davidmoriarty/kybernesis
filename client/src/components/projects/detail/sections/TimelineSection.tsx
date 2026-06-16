// client/src/components/projects/detail/sections/TimelineSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/timeAgo";

type TimelineEvent = {
  id: string;
  actorName: string | null;
  actorEmail: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type TimelineEventParts = {
  actor: string;
  action: string;
  subject?: string;
};

interface TimelineSectionProps {
  events?: TimelineEvent[];
}

function formatEventParts(event: TimelineEvent): TimelineEventParts {
  const actor = event.actorName || event.actorEmail || "Someone";

  switch (event.eventType) {
    case "project.created":
      return {
        actor,
        action: "created this project",
      };

    case "project.updated":
      return {
        actor,
        action: "updated this project",
      };

    case "project.archived":
      return {
        actor,
        action: "archived this project",
      };

    case "project.deleted":
      return {
        actor,
        action: "deleted this project",
      };

    case "member.added": {
      const email =
        typeof event.payload.email === "string"
          ? event.payload.email
          : "a member";

      const projectName =
        typeof event.payload.projectName === "string"
          ? event.payload.projectName
          : null;

      return {
        actor,
        action: projectName
          ? `added ${email} to "${projectName}"`
          : `added ${email}`,
      };
    }

    case "member.removed": {
      const email =
        typeof event.payload.email === "string"
          ? event.payload.email
          : "a member";

      const projectName =
        typeof event.payload.projectName === "string"
          ? event.payload.projectName
          : null;

      return {
        actor,
        action: projectName
          ? `removed ${email} from "${projectName}"`
          : `removed ${email}`,
      };
    }

    case "member.role_updated": {
      const email =
        typeof event.payload.email === "string"
          ? event.payload.email
          : "a member";

      const role =
        typeof event.payload.role === "string" ? event.payload.role : "member";

      const projectName =
        typeof event.payload.projectName === "string"
          ? event.payload.projectName
          : null;

      return {
        actor,
        action: projectName
          ? `changed ${email} role to ${role} in "${projectName}"`
          : `changed ${email} role to ${role}`,
      };
    }

    case "task.created": {
      const title =
        typeof event.payload.title === "string"
          ? event.payload.title
          : "a task";

      return {
        actor,
        action: "created task",
        subject: title,
      };
    }

    case "task.updated": {
      const title =
        typeof event.payload.title === "string"
          ? event.payload.title
          : "a task";

      return {
        actor,
        action: "updated task",
        subject: title,
      };
    }

    case "task.completed": {
      const title =
        typeof event.payload.title === "string"
          ? event.payload.title
          : "a task";

      return {
        actor,
        action: "completed task",
        subject: title,
      };
    }

    case "file.uploaded": {
      const name =
        typeof event.payload.name === "string" ? event.payload.name : "a file";

      return {
        actor,
        action: "uploaded file",
        subject: name,
      };
    }

    case "file.deleted": {
      const name =
        typeof event.payload.name === "string" ? event.payload.name : "a file";

      return {
        actor,
        action: "deleted file",
        subject: name,
      };
    }

    default:
      return {
        actor,
        action: `performed ${event.eventType}`,
      };
  }
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

  if (events.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">No timeline events yet.</p>
      </Card>
    );
  }

  return (
    <div className="relative flex flex-col gap-4">
      <div className="absolute left-9 top-0 bottom-0 w-px bg-border" />

      {events.map((event) => {
        const parts = formatEventParts(event);

        return (
          <Card
            key={event.id}
            className="p-4 pl-8 transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative flex flex-row items-center justify-start gap-4">
              {/* dot */}
              <div className="relative z-10 h-2 w-2 rounded-full bg-primary shrink-0" />

              <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
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

                {/* time */}
                <p
                  className="shrink-0 text-sm text-muted-foreground text-right"
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
