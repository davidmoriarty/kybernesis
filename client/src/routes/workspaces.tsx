// client/src/routes/workspaces.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LoadingState, ErrorState } from "@/components/shared/PageState";
import { Container, PageHero, Section } from "@/components/app";
import { WorkspaceDashboard } from "@/components/workspaces/WorkspaceDashboard";
import { useWorkspaceSummary } from "@/hooks/workspaces";
import { requireAuth } from "@/utils/requireAuth";

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
      <PageHero
        title="Workspaces"
        subtitle="Workspace overview + stats (MVP)"
      />

      <Section className="min-h-0 flex-1 overflow-auto pb-8">
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
