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

interface ProjectCardProps {
  id: number;
  name: string;
  description?: string;
}

export function ProjectCard({ id, name, description }: ProjectCardProps) {
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

  const title = !expanded
    ? name
    : editing
      ? "Project Edit View"
      : "Project Detail View";

  useLayoutEffect(() => {
    if (!contentRef.current) return;

    if (!expanded) {
      setEditing(false);
      setHighlight(false);
    } else {
      setHighlight(true);
      const timeout = setTimeout(() => setHighlight(false), 800);
      return () => clearTimeout(timeout);
    }
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
    setExpanded(false);
  };

  return (
    <div
      className={`
        border rounded-md px-8 py-6
        transition-colors duration-200
        ${expanded ? "shadow-md" : "shadow-sm"}
        hover:bg-muted/30
        ${highlight ? "bg-slate-200" : expanded ? "bg-slate-50" : "bg-white"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>

        <ButtonGroup>
          {expanded ? (
            <Button
              size="lg"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(false);
                setEditing(false);
              }}
            >
              Collapse
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
            >
              View
            </Button>
          )}

          <Button
            size="lg"
            variant="default"
            onClick={() =>
              navigate({
                to: "/projects/$projectId",
                params: { projectId: String(id) },
              })
            }
          >
            Open Project
          </Button>
        </ButtonGroup>
      </div>

      {/* Animated content */}
      <div className="overflow-hidden transition-all duration-300 ease-in-out">
        <div
          ref={contentRef}
          className={`mt-2 flex flex-col gap-2 transition-opacity duration-200
            ${expanded ? "opacity-100" : "opacity-0"}`}
        >
          {expanded && !editing && (
            <>
              {/* View Mode Content */}
              <h3 className="text-xl font-bold">{fullProject?.name}</h3>
              <p className="text-lg font-semibold">
                {fullProject?.description || "No description"}
              </p>

              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(true);
                  }}
                >
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
              {/* Edit Mode Content */}
              <label>
                Name
                <input
                  type="text"
                  className="border rounded p-2 w-full"
                  value={editName}
                  onChange={(e) => {
                    e.stopPropagation();
                    setEditName(e.target.value);
                  }}
                />
              </label>

              <label>
                Description
                <textarea
                  className="border rounded p-2 w-full"
                  value={editDescription}
                  onChange={(e) => {
                    e.stopPropagation();
                    setEditDescription(e.target.value);
                  }}
                />
              </label>

              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  disabled={updateProject.isPending}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(false);
                  }}
                >
                  Cancel
                </Button>

                <DeleteProjectDialog
                  onConfirm={handleDelete}
                  disabled={deleteProject.isPending}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
