import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceSummary } from "@/hooks/workspaces";

export function WorkspaceDashboard({ summary }: { summary: WorkspaceSummary }) {
  return (
    <section className="space-y-6">
      <div className="space-y-1 pl-2">
        <h2 className="font-semibold text-xl">{summary.workspace.name}</h2>

        <Badge
          variant={summary.workspace.role === "admin" ? "default" : "secondary"}
          className="capitalize"
        >
          <strong>Role: </strong>
          {summary.workspace.role}
        </Badge>

        <p className="text-sm text-gray-600">
          <strong>Workspace ID:</strong> {summary.workspace.id}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              Online if active within the last 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members found.</p>
            ) : (
              summary.members.map((m) => (
                <div key={m.id} className="flex items-center justify-between">
                  <span className="font-medium">{m.name}</span>

                  <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className={[
                        "inline-block h-2.5 w-2.5 rounded-full",
                        m.status === "online" ? "bg-emerald-500" : "bg-red-500",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                    <span className="capitalize">{m.status}</span>

                    {m.status === "offline" && m.lastSeenAt ? (
                      <span className="text-xs text-muted-foreground">
                        · last seen {formatLastSeen(m.lastSeenAt)}
                      </span>
                    ) : null}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>All projects (status TBD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {summary.counts.activeProjects}
            </div>
            {summary.recentProjects.length > 0 && (
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                {summary.recentProjects.map((p) => (
                  <div key={p.id} className="truncate">
                    {p.name}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Projects</CardTitle>
            <CardDescription>Requires project status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {summary.counts.completedProjects}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function formatLastSeen(iso: string): string {
  const last = new Date(iso).getTime();
  const diffMs = Date.now() - last;
  const mins = Math.max(0, Math.floor(diffMs / 60_000));

  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;

  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
