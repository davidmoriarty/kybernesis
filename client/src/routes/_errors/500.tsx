// client/src/routes/_errors/500.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/errors/ErrorPage";

export const Route = createFileRoute("/_errors/500")({
  component: () => <ErrorPage status={500} />,
});
