// client/src/components/ProjectList.tsx

import { ErrorState, LoadingState } from "@/components/PageCard";
import { ProjectCard } from "@/components/ProjectCard";
import { cn } from "@/lib/utils";
import type { ProjectView } from "./ProjectsToolbar";

interface Project {
  id: string;
  name: string;
  description?: string;
}

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
      <div className="border rounded-md p-6 text-center">No projects yet</div>
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
        <div className="grid grid-cols-[2fr_3fr_auto] gap-4 px-4 py-3 text-sm font-semibold border-b">
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
