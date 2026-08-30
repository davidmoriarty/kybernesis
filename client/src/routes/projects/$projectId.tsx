// client/src/routes/projects/$projectId.tsx

import type { Project } from "@shared";
import { createFileRoute } from "@tanstack/react-router";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  loader: async ({ params }) => {
    const res = await rpc.$get(`/projects/${params.projectId}`, {
      credentials: "include",
    });

    return parseOrThrow<
      Project & {
        owner: string;
      }
    >(res);
  },
  component: ProjectWorkspacePage,
});

function ProjectWorkspacePage() {
  const project = Route.useLoaderData();

  return (
    <div className="min-h-[calc(100dvh-var(--navbar-height))]">
      <h1 className="p-4 text-xl font-semibold">{project.name}</h1>
    </div>
  );
}
