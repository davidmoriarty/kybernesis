// client/src/components/ProjectCard.tsx
import { useNavigate } from "@tanstack/react-router";
import { useLayoutEffect, useRef, useState } from "react";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  useDeleteProject,
  useProject,
  useUpdateProject,
} from "@/hooks/projects";
import { cn } from "@/lib/utils";

export type ProjectView = "panel" | "grid" | "list";

interface ProjectCardProps {
  id: string;
  name: string;
  description?: string;
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
  };

  const handleDelete = async () => {
    await deleteProject.mutateAsync({ projectId: id });
  };

  /* ───────────────────────── PANEL VIEW ───────────────────────── */

  if (view === "panel") {
    return (
      <div
        className={cn(
          "bg-background rounded-md border px-8 py-6 shadow-sm transition-all",
          "hover:bg-background/80",
          expanded && "shadow-md",
          highlight && "bg-slate-200",
        )}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">
            {expanded
              ? editing
                ? "Project Edit View"
                : "Project Detail View"
              : name}
          </h2>

          <ButtonGroup>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setExpanded((v) => !v);
                setEditing(false);
              }}
            >
              {expanded ? "Collapse" : "View"}
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate({
                  to: "/projects/$projectId",
                  params: { projectId: id },
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
              <h3 className="text-xl font-bold">{fullProject?.name}</h3>
              <p className="text-sm text-muted-foreground">
                {fullProject?.description || "No description"}
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
                  size="sm"
                  onClick={handleSave}
                  disabled={updateProject.isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
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
      <div className="h-40 rounded-md border p-4 shadow-sm hover:bg-muted/20">
        <div className="flex h-full flex-col justify-between">
          <div>
            <h3 className="truncate text-lg font-bold">{name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {description || "No description"}
            </p>
          </div>

          <ButtonGroup>
            <Button
              size="sm"
              onClick={() =>
                navigate({
                  to: "/projects/$projectId",
                  params: { projectId: id },
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
    <div className="grid grid-cols-[2fr_3fr_auto] items-center gap-4 px-4 py-3 border-b hover:bg-muted/10">
      <div className="truncate font-medium">{name}</div>
      <div className="max-w-[40ch] truncate text-sm text-muted-foreground">
        {description || "—"}
      </div>
      <ButtonGroup>
        <Button
          size="sm"
          variant="default"
          onClick={() =>
            navigate({
              to: "/projects/$projectId",
              params: { projectId: id },
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
  );
}
