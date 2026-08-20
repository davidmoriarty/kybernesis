// client/src/components/workspaces/WorkspaceDashboard.tsx

import type { WorkspaceSummary } from "@/hooks/workspaces";
import { DashboardRowLink } from "../shared/DashboardRowLink";
import { Badge } from "@/components/ui/badge";
import { WorkspaceDashboardCard } from "./index";
import { WorkspaceDashboardColumns } from "./index";
import { ActivityFeed } from "@/components/activity";

export function WorkspaceDashboard({ summary }: { summary: WorkspaceSummary }) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <WorkspaceDashboardCard
        title="Members Overview"
        description="Workspace members and their current activity status."
      >
        {summary.members.length === 0 ? (
          <div className="text-sm text-muted-foreground">No members found.</div>
        ) : (
          summary.members.map((m) => (
            <WorkspaceDashboardColumns key={m.id}>
              <div className="text-start">{m.name}</div>

              <div className="space-x-2 text-center">
                <span
                  className={[
                    "inline-block h-2.5 w-2.5 rounded-full",
                    m.status === "online" ? "bg-emerald-500" : "bg-red-500",
                  ].join(" ")}
                  aria-hidden="true"
                />
                <span
                  className={[
                    "capitalize",
                    m.status === "online" ? "text-emerald-500" : "text-red-500",
                  ].join(" ")}
                >
                  {m.status}
                </span>
              </div>

              <div className="text-end text-sm text-muted-foreground">
                {m.status === "online"
                  ? "Now"
                  : m.lastSeenAt
                    ? formatLastSeen(m.lastSeenAt)
                    : "—"}
              </div>
            </WorkspaceDashboardColumns>
          ))
        )}
      </WorkspaceDashboardCard>

      <WorkspaceDashboardCard
        title="Projects Overview"
        description="Workspace projects and their development status."
      >
        {summary.recentProjects.length === 0 ? (
          <div className="col-span-3 text-sm text-muted-foreground">
            No projects found.
          </div>
        ) : (
          summary.recentProjects.map((p) => (
            <DashboardRowLink
              key={p.id}
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              search={{ section: "Overview" }}
              columns={3}
            >
              <div className="text-start hover:underline">{p.name}</div>

              <div className="text-center">
                <Badge
                  variant={p.status === "live" ? "success" : "secondary"}
                  className="mx-auto w-[80%]"
                >
                  {p.status === "live" ? "Live" : "Building"}
                </Badge>
              </div>

              <div className="text-end text-sm text-muted-foreground">
                {formatLastSeen(p.updatedAt)}
              </div>
            </DashboardRowLink>
          ))
        )}
      </WorkspaceDashboardCard>

      <WorkspaceDashboardCard
        title="Workspace Overview"
        description="Key totals and information for this workspace."
        //colHeaders={["Workspace", "Total Members", "Total Projects"]}
        footer={<span className="text-sm"></span>}
      >
        <WorkspaceDashboardColumns>
          <div className="text-start"> {summary.workspace.name}</div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="inline-flex justify-center">
              {summary.counts.members}
            </Badge>
            <span className="text-sm text-muted-foreground">Members</span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Badge variant="outline" className="inline-flex justify-center">
              {summary.counts.activeProjects}
            </Badge>
            <span className="text-sm text-muted-foreground">Projects</span>
          </div>
        </WorkspaceDashboardColumns>
      </WorkspaceDashboardCard>

      <WorkspaceDashboardCard
        title="Activity Feed"
        description="Recent workspace activity and events."
      >
        <ActivityFeed workspaceId={summary.workspace.id} />
      </WorkspaceDashboardCard>
    </div>
  );
}

function formatLastSeen(iso: string): string {
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
