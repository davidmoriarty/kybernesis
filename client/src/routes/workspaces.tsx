import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { meQueryOptions } from "@/hooks/auth";
import { useWorkspaces } from "@/hooks/workspaces";

export const Route = createFileRoute("/workspaces")({
  loader: meQueryOptions, // runs useMe before rendering the page
  component: WorkspacesPage,
});

function WorkspacesPage() {
  const { data: workspaces, isLoading, error } = useWorkspaces();

  if (isLoading) {
    return (
      <Section>
        <Container>
          <p>Loading workspaces...</p>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container>
          <p>Failed to load workspaces.</p>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Hero title="Workspaces" />

      <Section>
        <Container className="flex flex-col gap-4">
          {workspaces?.workspaces.length ? (
            workspaces.workspaces.map((ws) => (
              <div key={ws.id} className="border p-6 rounded-md">
                <strong className="text-lg">{ws.name}</strong>
                {ws.description && <p>{ws.description}</p>}
              </div>
            ))
          ) : (
            <div className="border p-6 rounded-md text-center">
              <p>No workspaces found.</p>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
