import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
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
export function ProjectCard({ id, name, description, view }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDescription, setEditDescription] = useState(description || "");
  const [highlight, setHighlight] = useState(false);
  const contentRef = useRef(null);
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
    return _jsxs("div", {
      className: cn(
        "bg-background rounded-md border px-8 py-6 shadow-sm transition-all",
        "hover:bg-background/80",
        expanded && "shadow-md",
        highlight && "bg-slate-200",
      ),
      children: [
        _jsxs("div", {
          className: "flex items-center justify-between",
          children: [
            _jsx("h2", {
              className: "text-2xl font-black tracking-tight",
              children: expanded
                ? editing
                  ? "Project Edit View"
                  : "Project Detail View"
                : name,
            }),
            _jsxs(ButtonGroup, {
              children: [
                _jsx(Button, {
                  size: "sm",
                  variant: "outline",
                  onClick: () => {
                    setExpanded((v) => !v);
                    setEditing(false);
                  },
                  children: expanded ? "Collapse" : "View",
                }),
                _jsx(Button, {
                  size: "sm",
                  onClick: () =>
                    navigate({
                      to: "/projects/$projectId",
                      params: { projectId: id },
                    }),
                  children: "Open",
                }),
                _jsx(DeleteProjectDialog, {
                  onConfirm: handleDelete,
                  disabled: deleteProject.isPending,
                }),
              ],
            }),
          ],
        }),
        _jsxs("div", {
          ref: contentRef,
          className: cn(
            "mt-4 flex flex-col gap-3 transition-opacity",
            expanded ? "opacity-100" : "opacity-0",
          ),
          children: [
            expanded &&
              !editing &&
              _jsxs(_Fragment, {
                children: [
                  _jsx("h3", {
                    className: "text-xl font-bold",
                    children: fullProject?.name,
                  }),
                  _jsx("p", {
                    className: "text-sm text-muted-foreground",
                    children: fullProject?.description || "No description",
                  }),
                  _jsxs("div", {
                    className: "mt-4 flex gap-2",
                    children: [
                      _jsx(Button, {
                        size: "sm",
                        onClick: () => setEditing(true),
                        children: "Edit",
                      }),
                      _jsx(DeleteProjectDialog, {
                        onConfirm: handleDelete,
                        disabled: deleteProject.isPending,
                      }),
                    ],
                  }),
                ],
              }),
            expanded &&
              editing &&
              _jsxs(_Fragment, {
                children: [
                  _jsxs("label", {
                    className: "flex flex-col gap-1",
                    children: [
                      _jsx("span", {
                        className: "text-sm font-medium",
                        children: "Name",
                      }),
                      _jsx("input", {
                        className: "rounded border p-2",
                        value: editName,
                        onChange: (e) => setEditName(e.target.value),
                      }),
                    ],
                  }),
                  _jsxs("label", {
                    className: "flex flex-col gap-1",
                    children: [
                      _jsx("span", {
                        className: "text-sm font-medium",
                        children: "Description",
                      }),
                      _jsx("textarea", {
                        className: "rounded border p-2",
                        value: editDescription,
                        onChange: (e) => setEditDescription(e.target.value),
                      }),
                    ],
                  }),
                  _jsxs(ButtonGroup, {
                    children: [
                      _jsx(Button, {
                        size: "sm",
                        onClick: handleSave,
                        disabled: updateProject.isPending,
                        children: "Save",
                      }),
                      _jsx(Button, {
                        size: "sm",
                        variant: "outline",
                        onClick: () => setEditing(false),
                        children: "Cancel",
                      }),
                      _jsx(DeleteProjectDialog, {
                        onConfirm: handleDelete,
                        disabled: deleteProject.isPending,
                      }),
                    ],
                  }),
                ],
              }),
          ],
        }),
      ],
    });
  }
  /* ───────────────────────── GRID VIEW ───────────────────────── */
  if (view === "grid") {
    return _jsx("div", {
      className: "h-40 rounded-md border p-4 shadow-sm hover:bg-muted/20",
      children: _jsxs("div", {
        className: "flex h-full flex-col justify-between",
        children: [
          _jsxs("div", {
            children: [
              _jsx("h3", {
                className: "truncate text-lg font-bold",
                children: name,
              }),
              _jsx("p", {
                className: "mt-1 line-clamp-2 text-sm text-muted-foreground",
                children: description || "No description",
              }),
            ],
          }),
          _jsxs(ButtonGroup, {
            children: [
              _jsx(Button, {
                size: "sm",
                onClick: () =>
                  navigate({
                    to: "/projects/$projectId",
                    params: { projectId: id },
                  }),
                children: "Open",
              }),
              _jsx(DeleteProjectDialog, {
                onConfirm: handleDelete,
                disabled: deleteProject.isPending,
              }),
            ],
          }),
        ],
      }),
    });
  }
  /* ───────────────────────── LIST VIEW ───────────────────────── */
  return _jsxs("div", {
    className:
      "grid grid-cols-[2fr_3fr_auto] items-center gap-4 px-4 py-3 border-b hover:bg-muted/10",
    children: [
      _jsx("div", { className: "truncate font-medium", children: name }),
      _jsx("div", {
        className: "max-w-[40ch] truncate text-sm text-muted-foreground",
        children: description || "—",
      }),
      _jsxs(ButtonGroup, {
        children: [
          _jsx(Button, {
            size: "sm",
            variant: "default",
            onClick: () =>
              navigate({
                to: "/projects/$projectId",
                params: { projectId: id },
              }),
            children: "Open",
          }),
          _jsx(DeleteProjectDialog, {
            onConfirm: handleDelete,
            disabled: deleteProject.isPending,
          }),
        ],
      }),
    ],
  });
}
