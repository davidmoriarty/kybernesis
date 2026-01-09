import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Container } from "@/components/Container";
import { FormLayout } from "@/components/FormLayout";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { meQueryOptions } from "@/hooks/auth";
import { useCreateProject, useProjects } from "@/hooks/projects";

export const Route = createFileRoute("/projects")({
  loader: meQueryOptions, // runs useMe before rendering the page
  component: ProjectsPage,
});

function ProjectsPage() {
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
    await createProject.mutateAsync({ name, description });
    setName("");
    setDescription("");
  };

  return (
    <>
      <Hero title="Projects" />

      {/* Project list */}
      <Section>
        <Container className="flex flex-col gap-4">
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : projectsError ? (
            <p>Failed to load projects.</p>
          ) : projects?.projects.length ? (
            projects.projects.map((p) => (
              <div
                key={p.id}
                className="border p-6 rounded-md flex flex-col gap-2"
              >
                <strong className="text-lg">{p.name}</strong>
                {p.description && <p>{p.description}</p>}
              </div>
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
          />

          <label htmlFor="description">Description</label>
          <input
            id="description"
            className="border p-2 rounded w-full"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={createProject.isPending}
          >
            Create Project
          </Button>
        </FormLayout>
      </Section>
    </>
  );
}
