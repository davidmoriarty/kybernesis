// client/src/routes/index.tsx

import type { MeResponse } from "shared";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { rpc } from "@/lib/rpc";
import { getTenantContext } from "@/lib/tenantContext";
import { getCurrentHostContext } from "@/lib/tenantHost";
import { Section } from "@/components/app/Section";
import { Container } from "@/components/app/Container";
import { Footer } from "@/components/app/Footer";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { surface } = getCurrentHostContext();

    if (surface === "public") {
      return;
    }

    const { tenantId } = await getTenantContext();

    if (!tenantId) {
      throw notFound();
    }

    const res = await rpc.$get("/auth/me", { credentials: "include" });

    if (res.status === 401) {
      throw redirect({ to: "/login" });
    }

    if (!res.ok) {
      throw redirect({ to: "/500" });
    }

    const me = (await res.json()) as MeResponse;

    if (surface === "admin") {
      if (me.tenantRole !== "owner" && me.tenantRole !== "admin") {
        throw redirect({ to: "/403" });
      }

      throw redirect({ to: "/admin" });
    }

    throw redirect({ to: "/projects" });
  },
  component: Index,
});

function Index() {
  return (
    <>
      {/* Hero section */}
      <Section padding="py-16 md:py-24">
        <Container>
          <div className="flex flex-col items-center justify-center gap-8 text-center">
            <h1 className="text-5xl font-extrabold md:text-6xl">Kybernesis</h1>

            <p className="max-w-3xl text-xl font-medium">
              Kybernesis provides the developer tools and infrastructure for
              teams to collaborate on projects.
            </p>
          </div>
        </Container>
      </Section>

      {/* Content section */}
      <Section
        padding="py-12 md:py-20"
        className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 text-center"
      >
        <Container className="max-w-5xl">
          <article>
            <header className="pb-6 text-center md:pb-8">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
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
