// client/src/routes/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Footer } from "@/components/Footer";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero section */}
      <Section className="bg-accent dark:bg-gray-600 min-h-[55vh] flex items-center">
        <Container className="flex flex-col items-center justify-center space-y-6 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-snug">
            Kybernesis
          </h1>

          <p className="max-w-[40ch] font-medium text-xl leading-relaxed">
            Kybernesis provides the developer tools and infrastructure for teams
            to collaborate on projects.
          </p>

          <div className="inline-flex space-x-6 py-6">
            <Button
              onClick={() => navigate({ to: "/signup" })}
              className="bg-emerald-500 px-12 py-5"
            >
              Get Started
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={() => navigate({ to: "/me" })}
              className="px-12 py-5"
            >
              Account page
            </Button>
          </div>
        </Container>
      </Section>

      {/* Content section */}
      <Section>
        <Container className="flex flex-col items-center justify-center space-y-6 text-center">
          <header className="space-y-4">
            <h2 className="font-bold text-2xl leading-relaxed">
              Manage Your Projects and Workspaces Seamlessly
            </h2>

            <p className="max-w-[60ch] text-lg leading-relaxed">
              Kybernesis is a multi-tenant SaaS platform designed for developers
              and teams to organize projects, collaborate across workspaces, and
              maintain full control over their data. Everything is type-safe,
              fast, and built to scale with your workflow.
            </p>

            <p className="max-w-[60ch] text-lg leading-relaxed">
              From project creation to workspace management, Kybernesis
              streamlines the entire development lifecycle in a single,
              intuitive interface powered by Bun, Hono, and React.
            </p>
          </header>
        </Container>
      </Section>
      <Footer />
    </>
  );
}

export default Index;
