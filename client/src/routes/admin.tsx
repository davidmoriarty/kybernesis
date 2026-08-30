// client/src/routes/admin.tsx

import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAdmin } from "@/utils/requireAdmin";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAdmin,
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
