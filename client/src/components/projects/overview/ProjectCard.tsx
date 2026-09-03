// client/src/components/ProjectCard.tsx

import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { ProjectView } from "./index";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  view?: ProjectView;
}

export function ProjectCard({ id, name, description, view }: ProjectCardProps) {
  const navigate = useNavigate();

  const openWorkspace = () => {
    navigate({
      to: "/projects/$projectId",
      params: { projectId: id },
    });
  };

  /* ───────────────────────── PANEL VIEW ───────────────────────── */

  if (view === "panel") {
    return (
      <div className="rounded-md bg-card px-8 py-6 shadow-sm transition-all hover:bg-card/80">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight uppercase md:text-lg">
              {name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {description ?? "No description"}
            </p>
          </div>

          <Button
            variant="solid"
            color="primary"
            size="sm"
            onClick={openWorkspace}
          >
            Open Workspace
          </Button>
        </div>
      </div>
    );
  }

  /* ───────────────────────── GRID VIEW ───────────────────────── */

  if (view === "grid") {
    return (
      <div className="h-40 rounded-md bg-card p-4 shadow-sm transition-all hover:bg-card/80">
        <div className="flex h-full flex-col justify-between">
          <div>
            <h3 className="truncate text-lg font-black">{name}</h3>
            <p className="mt-1 line-clamp-2 text-sm">
              {description ?? "No description"}
            </p>
          </div>

          <div>
            <Button
              variant="solid"
              color="primary"
              size="sm"
              onClick={openWorkspace}
            >
              Open Workspace
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ───────────────────────── LIST VIEW ───────────────────────── */

  return (
    <div className="border-b px-4 py-4 hover:bg-muted/80 md:grid md:grid-cols-[2fr_3fr_auto] md:items-center md:gap-4 md:py-5">
      <div className="min-w-0 font-black text-base md:truncate">{name}</div>

      <div className="mt-1 text-sm text-muted-foreground md:mt-0 md:max-w-[40ch] md:truncate">
        {description ?? "—"}
      </div>

      <Button
        className="mt-3 shrink-0 md:mt-0"
        variant="solid"
        color="primary"
        size="sm"
        onClick={openWorkspace}
      >
        Open Workspace
      </Button>
    </div>
  );
}
