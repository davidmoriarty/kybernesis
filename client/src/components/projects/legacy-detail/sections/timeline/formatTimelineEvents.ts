// client/src/components/projects/detail/sections/timeline/formatTimelineEvents.ts

export type TimelineEvent = {
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

export function formatTimelineEvent(event: TimelineEvent): TimelineEventParts {
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

    case "file.updated": {
      const name =
        typeof event.payload.name === "string" ? event.payload.name : "a file";

      return {
        actor,
        action: "updated file",
        subject: name,
      };
    }

    case "file.renamed": {
      const previousName =
        typeof event.payload.previousName === "string"
          ? event.payload.previousName
          : "a file";

      const name =
        typeof event.payload.name === "string" ? event.payload.name : "a file";

      return {
        actor,
        action: `renamed file "${previousName}" to`,
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
