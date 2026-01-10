import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/error/ErrorPage";

export const Route = createFileRoute("/_errors/500")({
  component: () => <ErrorPage status={500} />,
});
