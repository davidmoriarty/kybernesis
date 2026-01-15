// client/src/routes/projects/$projectId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useProject } from "@/hooks/projects";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  component: ProjectPage,
});

function ProjectPage() {
  const { projectId } = Route.useParams();
  const id = Number(projectId);

  const { data: project, isLoading, error } = useProject(id);

  if (isLoading) return <p>Loading project...</p>;
  if (error) return <p>Failed to load project.</p>;
  if (!project) return <p>Project not found.</p>;

  return (
    <>
      <Hero
        title={project.name}
        subtitle={project.description || "No description"}
      />

      <Section>
        <Container>
          <p>
            <strong>Project ID:</strong> {project.id}
          </p>
          {project.description && <p>{project.description}</p>}
        </Container>
      </Section>
    </>
  );
}
