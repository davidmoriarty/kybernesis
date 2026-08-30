// client/src/routes/admin/projects/$projectId.tsx

import type { Project } from "@shared";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from "@/components/app";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";

export const Route = createFileRoute("/admin/projects/$projectId")({
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
  component: AdminProjectPage,
});

function AdminProjectPage() {
  const project = Route.useLoaderData();

  return (
    <Section padding="py-8 md:py-10">
      <Container>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Project Management</p>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        </div>
      </Container>
    </Section>
  );
}
