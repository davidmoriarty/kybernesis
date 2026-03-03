// client/src/routes/workspaces.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
import { PageCard } from "@/components/PageCard";
import { WorkspaceDashboard } from "@/components/workspaces/WorkspaceDashboard";
import { useWorkspaceSummary } from "@/hooks/workspaces";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/workspaces")({
  beforeLoad: requireAuth,
  component: WorkspacesPage,
});

// Reusable small components for loading / error states
function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <p className="text-center text-lg">
      <span className="animate-spin inline-block mr-2">⏳</span>
      {message}
    </p>
  );
}

function ErrorState({
  message = "Something went wrong.",
}: {
  message?: string;
}) {
  return <p className="text-center text-lg text-destructive">{message}</p>;
}

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
          <div className="max-w-7xl mx-auto">
            <h1 className="font-black text-4xl">Workspace</h1>
            <p className="text-sm text-muted-foreground">
              Workspace overview + stats (MVP)
            </p>
          </div>
        </Container>
      </Section>

      <PageCard>
        {summaryLoading ? (
          <LoadingState message="Loading workspace context..." />
        ) : summaryError ? (
          <ErrorState message="Failed to load workspace dashboard." />
        ) : summary ? (
          <WorkspaceDashboard summary={summary} />
        ) : (
          <ErrorState message="No workspace dashboard data found." />
        )}
      </PageCard>
    </>
  );
}
