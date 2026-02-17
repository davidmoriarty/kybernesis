// client/src/routes/workspaces.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PageCard } from "@/components/PageCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useConditionalMe } from "@/hooks/useContidionalMe";
import { useWorkspaces } from "@/hooks/workspaces";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/workspaces")({
  beforeLoad: requireAuth,
  component: WorkspacesPage,
});

// WorkspaceList handles loading, error, and mapping workspaces
function WorkspaceList({
  workspaces,
  isLoading,
  error,
  meWorkspaceId,
  meRole,
}: {
  workspaces?: NonNullable<
    ReturnType<typeof useWorkspaces>["data"]
  >["workspaces"];
  isLoading: boolean;
  error: unknown;
  meWorkspaceId?: number;
  meRole?: string;
}) {
  if (isLoading) return <LoadingState message="Loading workspaces..." />;
  if (error) return <ErrorState message="Failed to load workspaces." />;
  if (!workspaces?.length) return <p>No workspaces found.</p>;

  return (
    <>
      {workspaces.map((ws) => (
        <WorkspaceCard
          key={ws.id}
          ws={ws}
          role={meWorkspaceId === ws.id ? meRole : undefined}
        />
      ))}
    </>
  );
}

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

function WorkspaceCard({
  ws,
  role,
}: {
  ws: NonNullable<
    ReturnType<typeof useWorkspaces>["data"]
  >["workspaces"][number];
  role?: string;
}) {
  return (
    <Card className="w-full max-w-3xl border-none shadow-none bg-transparent">
      <CardHeader>
        <CardTitle>{ws.name}</CardTitle>
        {ws.description && <CardDescription>{ws.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p>
          <strong>ID:</strong> {ws.id}
        </p>
        {role && (
          <p>
            <strong>Role:</strong> {role}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function WorkspacesPage() {
  const { data: me } = useConditionalMe();
  const {
    data: workspaces,
    isLoading,
    error,
  } = useWorkspaces({
    enabled: !!me?.user,
  });

  return (
    <PageCard>
      <header className="text-center py-8">
        <h1 className="font-black text-3xl">Workspaces</h1>
      </header>

      <WorkspaceList
        workspaces={workspaces?.workspaces}
        isLoading={isLoading}
        error={error}
        meWorkspaceId={me?.workspace?.id}
        meRole={me?.workspace?.role}
      />
    </PageCard>
  );
}
