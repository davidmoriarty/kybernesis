// client/src/routes/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Hero title="Welcome to Kybernesis" />

      <Section>
        <Container>
          <div className="max-w-5xl mx-auto space-y-4">
            <h2 className="text-2xl font-bold text-center">
              Manage Your Projects and Workspaces Seamlessly
            </h2>

            <p className="max-w-[80ch] mx-auto text-justify">
              Kybernesis is a multi-tenant SaaS platform designed for developers
              and teams to organize projects, collaborate across workspaces, and
              maintain full control over their data. Everything is type-safe,
              fast, and built to scale with your workflow.
            </p>

            <p className="max-w-[80ch] mx-auto text-justify">
              From project creation to workspace management, Kybernesis
              streamlines the entire development lifecycle in a single,
              intuitive interface powered by Bun, Hono, and React.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default Index;
