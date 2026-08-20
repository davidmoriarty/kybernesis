// client/src/components/ProjectCard.tsx

import { useNavigate } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import type { ProjectView } from "./index";
import { DeleteProjectDialog } from "@/components/projects/detail/dialogs";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  useDeleteProject,
  useProject,
  useUpdateProject,
} from "@/hooks/projects";
import { cn } from "@/lib/utils";
import { appToast } from "@/lib/toast";

interface ProjectCardProps {
  id: string;
  name: string;
  description: string | null;
  view?: ProjectView;
}

export function ProjectCard({ id, name, description, view }: ProjectCardProps) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description || "");
  const [highlight, setHighlight] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: fullProject } = useProject(id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  useLayoutEffect(() => {
    if (!expanded) {
      setEditing(false);
      setHighlight(false);
      return;
    }

    setHighlight(true);
    const t = setTimeout(() => setHighlight(false), 800);
    return () => clearTimeout(t);
  }, [expanded]);

  const handleSave = async () => {
    await updateProject.mutateAsync({
      projectId: id,
      name: editName,
      description: editDescription,
    });

    setEditing(false);
    appToast.projects.updateSuccess();
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync({ projectId: id });
  };

  /* ───────────────────────── PANEL VIEW ───────────────────────── */

  if (view === "panel") {
    return (
      <div
        className={cn(
          "bg-card rounded-md px-8 py-6 shadow-sm transition-all",
          "hover:bg-card/80",
          expanded && "shadow-md",
          highlight && "bg-slate-200",
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-4",
            "sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <h2 className="text-base font-bold tracking-tight uppercase md:text-lg">
            {expanded
              ? editing
                ? "Project Edit View"
                : "Project Detail View"
              : name}
          </h2>

          <ButtonGroup>
            <Button
              variant="solid"
              color="primary"
              size="sm"
              onClick={() => {
                setExpanded((v) => !v);
                setEditing(false);
              }}
            >
              {expanded ? "Collapse" : "View"}
            </Button>

            <Button
              variant="solid"
              color="success"
              size="sm"
              onClick={() =>
                navigate({
                  to: "/projects/$projectId",
                  params: { projectId: id },
                  search: { section: "Overview" },
                })
              }
            >
              Open
            </Button>
            <DeleteProjectDialog
              onConfirm={handleDelete}
              disabled={deleteProject.isPending}
            />
          </ButtonGroup>
        </div>

        <div
          ref={contentRef}
          className={cn(
            "mt-4 flex flex-col gap-3 transition-opacity",
            expanded ? "opacity-100" : "opacity-0",
          )}
        >
          {expanded && !editing && (
            <>
              <h3 className="text-lg font-black">{fullProject?.name}</h3>
              <p className="text-base">
                {fullProject?.description ?? "No description"}
              </p>

              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
                <DeleteProjectDialog
                  onConfirm={handleDelete}
                  disabled={deleteProject.isPending}
                />
              </div>
            </>
          )}

          {expanded && editing && (
            <>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Name</span>
                <input
                  className="rounded border p-2"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  className="rounded border p-2"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </label>

              <ButtonGroup>
                <Button
                  variant="solid"
                  color="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  color="secondary"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <DeleteProjectDialog
                  onConfirm={handleDelete}
                  disabled={deleteProject.isPending}
                />
              </ButtonGroup>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ───────────────────────── GRID VIEW ───────────────────────── */

  if (view === "grid") {
    return (
      <div className="bg-card hover:bg-card/80 h-40 rounded-md p-4 shadow-sm transition-all">
        <div className="flex h-full flex-col justify-between">
          <div>
            <h3 className="truncate text-lg font-black">{name}</h3>
            <p className="mt-1 line-clamp-2 text-sm">
              {description ?? "No description"}
            </p>
          </div>

          <ButtonGroup>
            <Button
              variant="solid"
              color="primary"
              size="sm"
              onClick={() =>
                navigate({
                  to: "/projects/$projectId",
                  params: { projectId: id },
                  search: { section: "Overview" },
                })
              }
            >
              Open
            </Button>
            <DeleteProjectDialog
              onConfirm={handleDelete}
              disabled={deleteProject.isPending}
            />
          </ButtonGroup>
        </div>
      </div>
    );
  }

  /* ───────────────────────── LIST VIEW ───────────────────────── */

  return (
    <div className="border-b px-4 py-4 hover:bg-muted/80 md:grid md:grid-cols-[2fr_3fr_auto] md:items-center md:gap-4 md:py-5">
      <div className="flex items-center justify-between gap-4 md:contents">
        <div className="min-w-0 font-black text-base md:col-start-1 md:row-start-1 md:truncate">
          {name}
        </div>

        <ButtonGroup className="shrink-0 md:col-start-3 md:row-start-1">
          <Button
            variant="solid"
            color="primary"
            size="sm"
            onClick={() =>
              navigate({
                to: "/projects/$projectId",
                params: { projectId: id },
                search: { section: "Overview" },
              })
            }
          >
            Open
          </Button>

          <DeleteProjectDialog
            onConfirm={handleDelete}
            disabled={deleteProject.isPending}
          />
        </ButtonGroup>
      </div>

      <div className="mt-1 text-sm text-muted-foreground md:col-start-2 md:row-start-1 md:mt-0 md:max-w-[40ch] md:truncate">
        {description ?? "—"}
      </div>
    </div>
  );
}
