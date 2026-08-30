// client/src/routes/admin.index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { Container, Section } from "@/components/app";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <Section padding="py-12 md:py-20 lg:py-30">
      <Container>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      </Container>
    </Section>
  );
}
