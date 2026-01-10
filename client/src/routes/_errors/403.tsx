// client/src/routes/_errors/403.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/error/ErrorPage";

export const Route = createFileRoute("/_errors/403")({
  component: () => <ErrorPage status={403} />,
});
