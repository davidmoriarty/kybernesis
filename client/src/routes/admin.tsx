// client/src/routes/admin.tsx

import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/utils/requireAdmin";
import { Section } from "@/components/app/Section";
import { Container } from "@/components/app";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAdmin,
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <Section>
      <Container>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </Container>
    </Section>
  );
}
