// client/src/routes/me.tsx
import { createFileRoute } from "@tanstack/react-router";
import { Container } from "@/components/Container";
import { Hero } from "@/components/Hero";
import { Section } from "@/components/Section";
import { useMe } from "@/hooks/auth";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/me")({
  beforeLoad: requireAuth,
  component: MePage,
});

function MePage() {
  const { data } = useMe();
  if (!data) return null;

  const { user, workspace } = data;

  return (
    <>
      <Hero title={`Welcome, ${user.name}`} />

      <Section>
        <Container>
          <div className="flex flex-col items-center gap-4 space-y-2">
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>User:</strong> {user.email} (ID: {user.id})
            </p>
            {workspace && (
              <p>
                <strong>Workspace:</strong> {workspace.name} (Role:{" "}
                {workspace.role})
              </p>
            )}
          </div>
        </Container>
      </Section>

      <Section className="bg-slate-50">
        <Container>
          <pre className="max-w-md mx-auto">
            {JSON.stringify({ user, workspace }, null, 2)}
          </pre>
        </Container>
      </Section>
    </>
  );
}
