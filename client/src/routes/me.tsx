import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/hooks/auth";

export const Route = createFileRoute("/me")({
  component: MePage,
});

function MePage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useMe();
  const logout = useLogout();

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error || !data?.user) {
    return (
      <div className="p-8">
        <p className="mb-4">You are not logged in.</p>
        <Button onClick={() => navigate({ to: "/login" })}>Go to login</Button>
      </div>
    );
  }

  const { user, workspace } = data;

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Me</h1>

      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify({ user, workspace }, null, 2)}
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
