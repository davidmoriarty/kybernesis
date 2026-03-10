// client/src/routes/workspaces.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LoadingState, ErrorState } from "@/components/shared/PageCard";
import { PageHero } from "@/components/app";
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

      {summaryLoading ? (
        <LoadingState message="Loading workspace context..." />
      ) : summaryError ? (
        <ErrorState message="Failed to load workspace dashboard." />
      ) : summary ? (
        <WorkspaceDashboard summary={summary} />
      ) : (
        <ErrorState message="No workspace dashboard data found." />
      )}
    </>
  );
}
