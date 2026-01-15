// client/src/routes/projects.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Container } from "@/components/Container";
import { FormLayout } from "@/components/FormLayout";
import { Hero } from "@/components/Hero";
import { ProjectCard } from "@/components/ProjectCard";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/auth";
import { useCreateProject, useProjects } from "@/hooks/projects";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects")({
  beforeLoad: requireAuth,
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: me } = useMe();

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!me?.workspace) {
      console.error("No active workspace");
      toast.error("No active workspace selected.");
      return;
    }

    const workspaceId = Number(me.workspace.id);

    try {
      await createProject.mutateAsync({
        name,
        description,
        workspaceId,
      });

      setName("");
      setDescription("");
      toast.success("Project created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project.");
    }
  };

  return (
    <>
      <Hero title="Projects" subtitle="All your active projects in one place" />

      {/* Project list */}
      <Section>
        <Container className="flex flex-col gap-4">
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : projectsError ? (
            <p>Failed to load projects.</p>
          ) : projects?.projects.length ? (
            projects.projects.map((p) => (
              <ProjectCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
              />
            ))
          ) : (
            <div className="border p-6 rounded-md text-center">
              <p>No projects yet</p>
            </div>
          )}
        </Container>
      </Section>

      {/* Create project form */}
      <Section>
        <FormLayout
          title="Create a new project"
          description="Start a new project in your workspace"
          onSubmit={handleCreate}
        >
          <label htmlFor="name">Project name</label>
          <input
            id="name"
            className="border p-2 rounded w-full"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
          />

          <label htmlFor="description">Description</label>
          <input
            id="description"
            className="border p-2 rounded w-full"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoComplete="off"
          />

          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={createProject.isPending || !me?.workspace}
          >
            Create Project
          </Button>
        </FormLayout>
      </Section>

      {/* Outlet for child routes like /projects/$projectId */}
      <Outlet />
    </>
  );
}
