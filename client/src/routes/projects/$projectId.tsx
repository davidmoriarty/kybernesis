// client/src/routes/projects/$projectId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
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
  if (error || !project) return <p>Project not found.</p>;

  return (
    <>
      <Hero
        title={project.name}
        subtitle={project.description || "No description"}
      />

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-[260px_1fr] min-h-[60vh]">
            {/* Sidebar */}
            <aside className="rounded-lg border bg-card p-4">
              <nav className="flex flex-col gap-2 text-sm">
                <Button className="text-left font-medium">Overview</Button>
                <Button className="text-left text-muted-foreground">
                  Files
                </Button>
                <Button className="text-left text-muted-foreground">
                  Tasks
                </Button>
                <Button className="text-left text-muted-foreground">
                  Timeline
                </Button>
                <Button className="text-left text-muted-foreground">
                  Settings
                </Button>
              </nav>
            </aside>

            {/* Main content */}
            <main className="rounded-lg border bg-card p-6">
              <h2 className="text-xl font-bold mb-2">Overview</h2>
              <p className="text-muted-foreground">
                Project workspace content will live here.
              </p>
            </main>
          </div>
        </Container>
      </Section>
    </>
  );
}
