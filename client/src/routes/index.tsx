// client/src/routes/index.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Section } from "@/components/app/Section";
import { Container } from "@/components/app/Container";
import { Footer } from "@/components/app/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero section */}
      <Section padding="py-50" className="bg-gray-300 dark:bg-gray-600">
        <Container>
          <div className="flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="font-extrabold text-5xl md:text-6xl">Kybernesis</h1>
            <p className="max-w-[30ch] md:max-w-[40ch] lg:max-w-full font-medium text-xl">
              Kybernesis provides the developer tools and infrastructure for
              teams to collaborate on projects.
            </p>

            <Button
              onClick={() => navigate({ to: "/projects" })}
              className="w-80 h-12"
            >
              Get Started
            </Button>
          </div>
        </Container>
      </Section>

      {/* Content section */}
      <Section padding="py-40">
        <Container className="max-w-5xl">
          <article>
            <header className="pb-8 text-center">
              <h2 className="font-bold text-4xl tracking-tight">
                Manage Your Projects and Workspaces Seamlessly
              </h2>
            </header>

            <section className="flex flex-col items-center justify-center gap-4 text-center">
              <p className="font-medium text-base leading-relaxed">
                Kybernesis is a multi-tenant SaaS platform designed for
                developers and teams to organize projects, collaborate across
                workspaces, and maintain full control over their data.
                Everything is type-safe, fast, and built to scale with your
                workflow.
              </p>

              <p className="font-medium text-base leading-relaxed">
                From project creation to workspace management, Kybernesis
                streamlines the entire development lifecycle in a single,
                intuitive interface powered by Bun, Hono, and React.
              </p>
            </section>
          </article>
        </Container>
      </Section>
      <Footer />
    </>
  );
}

export default Index;
