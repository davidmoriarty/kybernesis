// client/src/routes/_errors/401.tsx
import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/error/ErrorPage";

export const Route = createFileRoute("/_errors/401")({
  component: () => <ErrorPage status={401} />,
});
