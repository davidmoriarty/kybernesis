// client/src/routes/projects.tsx

import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageCard } from "@/components/PageCard";
import { ProjectList } from "@/components/projects/ProjectList";
import {
  ProjectsToolbar,
  type ProjectView,
} from "@/components/projects/ProjectsToolbar";
import { useProjects } from "@/hooks/projects";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects")({
  beforeLoad: requireAuth,
  component: ProjectsPage,
});

const VIEW_STORAGE_KEY = "projects:view";

function ProjectsPage() {
  const matchRoute = useMatchRoute();
  const isProjectRoute = Boolean(matchRoute({ to: "/projects/$projectId" }));

  const [view, setView] = useState<ProjectView>(() => {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    return stored === "panel" || stored === "grid" || stored === "list"
      ? stored
      : "panel";
  });

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  if (isProjectRoute) {
    return <Outlet />;
  }

  return (
    <>
      <ProjectsToolbar view={view} onViewChange={setView} />

      <PageCard>
        <ProjectList
          projects={projects?.projects}
          view={view}
          isLoading={projectsLoading}
          error={projectsError}
        />
      </PageCard>

      <Outlet />
    </>
  );
}
