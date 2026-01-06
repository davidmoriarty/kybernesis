import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/auth";
import { useCreateProject, useProjects } from "@/hooks/projects";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = useNavigate();
  const logout = useLogout();
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="mb-4">You are not logged in.</p>
        <Button onClick={() => navigate({ to: "/login" })}>Go to login</Button>
      </div>
    );
  }

  const handleCreate = async () => {
    await createProject.mutateAsync({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      {/* List of projects */}
      <div className="space-y-2">
        {projects?.projects.length ? (
          projects.projects.map((p) => (
            <div key={p.id} className="border p-2 rounded">
              <strong>{p.name}</strong>
              {p.description && <p>{p.description}</p>}
            </div>
          ))
        ) : (
          <p>No projects yet</p>
        )}
      </div>

      {/* Create project form */}
      <div className="space-y-2 max-w-md">
        <input
          className="border p-2 rounded w-full"
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={createProject.isPending}>
          Create Project
        </Button>
      </div>

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
