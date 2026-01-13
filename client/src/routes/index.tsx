// client/src/routes/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  return (
    <>
      <Section className="bg-accent">
        <Container className="flex min-h-[50vh] justify-center">
          <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-center tracking-tight leading-snug">
              Kybernesis
            </h1>

            <p className="max-w-[40ch] text-center font-medium text-xl tracking-tight leading-relaxed">
              Kybernesis provides the developer tools and infrastructure for
              teams to collaborate on projects.
            </p>

            <div className="inline-flex space-x-6 py-6">
              <Button
                onClick={() => navigate({ to: "/signup" })}
                className="bg-emerald-500 px-12 py-5 cursor-pointer"
              >
                Get Started
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate({ to: "/me" })}
                className="px-12 py-5 cursor-pointer"
              >
                Account page
              </Button>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-center font-bold text-2xl leading-relaxed">
            Manage Your Projects and Workspaces Seamlessly
          </h2>

          <p className="max-w-[60ch] text-justify text-lg leading-relaxed">
            Kybernesis is a multi-tenant SaaS platform designed for developers
            and teams to organize projects, collaborate across workspaces, and
            maintain full control over their data. Everything is type-safe,
            fast, and built to scale with your workflow.
          </p>

          <p className="max-w-[60ch] text-justify text-lg leading-relaxed">
            From project creation to workspace management, Kybernesis
            streamlines the entire development lifecycle in a single, intuitive
            interface powered by Bun, Hono, and React.
          </p>
        </Container>
      </Section>
    </>
  );
}

export default Index;
