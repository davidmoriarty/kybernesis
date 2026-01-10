// client/src/routes/workspaces.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useConditionalMe } from "@/hooks/useContidionalMe";
import { useWorkspaces } from "@/hooks/workspaces";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/workspaces")({
  beforeLoad: requireAuth,
  component: WorkspacesPage,
});

function WorkspacesPage() {
  const { data: me } = useConditionalMe();

  const {
    data: workspaces,
    isLoading,
    error,
  } = useWorkspaces({
    enabled: !!me?.user,
  });

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
