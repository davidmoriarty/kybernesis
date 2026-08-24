// client/src/components/ProjectList.tsx

import type { Project } from "@shared";
import { ErrorState, LoadingState } from "@/components/shared/PageState";
import { type ProjectView, ProjectCard } from "./index";
import { cn } from "@/lib/utils";

interface ProjectListProps {
  projects?: Project[];
  view: ProjectView;
  isLoading: boolean;
  error: unknown;
}

export function ProjectList({
  projects,
  view,
  isLoading,
  error,
}: ProjectListProps) {
  if (isLoading) {
    return <LoadingState message="Loading projects..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load projects." />;
  }

  if (!projects?.length) {
    return (
      <div className="rounded-md border border-dashed px-6 py-10 text-center">
        <p className="text-sm font-medium">No projects yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first project to start organizing work in this workspace.
        </p>
      </div>
    );
  }

  const listClass = cn(
    view === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : view === "list"
        ? ""
        : "space-y-4",
  );

  return (
    <>
      {view === "list" && (
        <div className="hidden border-b px-4 py-3 text-lg font-bold md:grid md:grid-cols-[2fr_3fr_auto] md:gap-4">
          <div>Name</div>
          <div>Description</div>
          <div>Actions</div>
        </div>
      )}

      <div className={listClass}>
        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            id={p.id}
            name={p.name}
            description={p.description}
            view={view}
          />
        ))}
      </div>
    </>
  );
}
