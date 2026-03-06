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
      <div className="space-y-2 pb-4">
        <h2 className="font-bold text-2xl">{summary.workspace.name}</h2>

        <Badge
          variant={summary.workspace.role === "admin" ? "default" : "secondary"}
          className="capitalize text-base"
        >
          <strong>Role: </strong>
          {summary.workspace.role}
        </Badge>

        <p className="text-base">
          <strong>Workspace ID:</strong> {summary.workspace.id}
        </p>
      </div>

      <div className="grid gap-4 grid-col-1 lg:grid-cols-3">
        <Card className="bg-slate-400 dark:bg-slate-600 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="font-black text-2xl text-background">
              Members
            </CardTitle>
            <CardDescription className="font-medium text-base text-background">
              Online if active within the last 5 minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-background">
            <div className="font-bold text-lg text-muted mb-3">
              {summary.counts.members} Members
            </div>
            <hr className="mb-3" />
            {summary.members.length === 0 ? (
              <p className="text-base text-background">No members found.</p>
            ) : (
              summary.members.map((m) => (
                <div key={m.id} className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-base text-background">{m.name}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-base text-background">
                    <span
                      className={[
                        "inline-block h-2.5 w-2.5 rounded-full",
                        m.status === "online"
                          ? "bg-emerald-400"
                          : "bg-rose-600",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                    <span
                      className={[
                        "capitalize",
                        m.status === "online"
                          ? "text-emerald-400"
                          : "text-rose-600",
                      ].join(" ")}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div>
                    {m.status === "offline" && m.lastSeenAt ? (
                      <span className="text-sm text-background">
                        {formatLastSeen(m.lastSeenAt)}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-400 dark:bg-slate-600 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="font-black text-2xl text-background">
              Active Projects
            </CardTitle>
            <CardDescription className="font-medium text-base text-background">
              All projects (status TBD)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-lg text-muted mb-3">
              {summary.counts.activeProjects} Projects
            </div>
            <hr className="pb-3" />
            {summary.recentProjects.length > 0 && (
              <div className="mt-3 space-y-2 text-base text-background">
                {summary.recentProjects.map((p) => (
                  <div key={p.id} className="truncate grid grid-cols-2 gap-4">
                    <div>
                      <span>{p.name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-background">
                        Updated {formatLastSeen(p.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-400 dark:bg-slate-600 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="font-black text-2xl text-background">
              Completed Projects
            </CardTitle>
            <CardDescription className="font-medium text-base text-background">
              Requires project status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-lg text-muted mb-3">
              {summary.counts.completedProjects} Complete
            </div>
            <hr className="pb-3" />
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
  if (mins < 60) return `${mins} mins ago`;

  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hr ago";
  if (hours < 24) return `${hours} hrs ago`;

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
