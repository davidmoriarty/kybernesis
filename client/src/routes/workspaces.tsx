import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth";
import { useWorkspaces } from "@/hooks/workspaces";

export const Route = createFileRoute("/workspaces")({
  component: WorkspacesPage,
});

function WorkspacesPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const workspaces = useWorkspaces();

  if (workspaces.isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (workspaces.error) {
    return (
      <div className="p-8">
        <p className="mb-4">You are not logged in.</p>
        <Button onClick={() => navigate({ to: "/login" })}>Go to login</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Workspaces</h1>

      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(workspaces.data, null, 2)}
      </pre>

      <Button
        variant="secondary"
        onClick={() =>
          logout.mutate(undefined, {
            onSuccess: () => navigate({ to: "/login" }),
          })
        }
      >
        Logout
      </Button>
    </div>
  );
}
