// client/src/routes/workspaces.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
import { WorkspaceDashboard } from "@/components/workspaces/WorkspaceDashboard";
import { useWorkspaceSummary } from "@/hooks/workspaces";
import { requireAuth } from "@/utils/requireAuth";
import { LoadingState, ErrorState } from "@/components/PageCard";

export const Route = createFileRoute("/workspaces")({
  beforeLoad: requireAuth,
  component: WorkspacesPage,
});

function WorkspacesPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useWorkspaceSummary();

  return (
    <>
      <Section>
        <Container>
          <h1 className="font-black text-4xl">Workspace</h1>
          <p className="font-medium text-base mt-2">
            Workspace overview + stats (MVP)
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          {summaryLoading ? (
            <LoadingState message="Loading workspace context..." />
          ) : summaryError ? (
            <ErrorState message="Failed to load workspace dashboard." />
          ) : summary ? (
            <WorkspaceDashboard summary={summary} />
          ) : (
            <ErrorState message="No workspace dashboard data found." />
          )}
        </Container>
      </Section>
    </>
  );
}
