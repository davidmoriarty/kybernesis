import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/auth";
import { useCreateProject } from "@/hooks/projects";
export function FormDialog({ cta, heading, subheading }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const createProject = useCreateProject();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const isSubmitDisabled =
    createProject.isPending || !me?.workspace || !name.trim();
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!me?.workspace) {
      toast.error("No active workspace selected.");
      return;
    }
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }
    const workspaceId = me.workspace.id;
    // Temporary project ID for optimistic update
    const tempId = crypto.randomUUID();
    const nowIso = new Date().toISOString();
    const optimistic = {
      id: tempId,
      workspaceId,
      name,
      description,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    // Optimistically add project to the query cache
    qc.setQueryData(["projects"], (oldData) => {
      if (!oldData) return { projects: [optimistic] };
      return {
        ...oldData,
        projects: [...oldData.projects, optimistic],
      };
    });
    try {
      // Perform the mutation to create the project on the server
      const result = await createProject.mutateAsync({
        name,
        description,
        workspaceId,
      });
      // Close form and reset fields
      setName("");
      setDescription("");
      setOpen(false);
      // Replace temp project with real project in the cache
      qc.setQueryData(["projects"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          projects: oldData.projects.map((p) =>
            p.id === tempId ? result.project : p,
          ),
        };
      });
      // Navigate to the new project page
      navigate({
        to: "/projects/$projectId",
        params: { projectId: String(result.project.id) },
      });
      toast.success("Project created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create project.");
      // Remove temporary project if mutation fails
      qc.setQueryData(["projects"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          projects: oldData.projects.filter((p) => p.id !== tempId),
        };
      });
    }
  };
  return _jsxs(Dialog, {
    open: open,
    onOpenChange: setOpen,
    children: [
      _jsx(DialogTrigger, {
        asChild: true,
        children: _jsx("div", {
          className: "flex items-center justify-center",
          children: _jsx(Button, {
            variant: "default",
            size: "sm",
            children: cta,
          }),
        }),
      }),
      _jsx(DialogContent, {
        className: "sm:max-w-md",
        children: _jsxs("form", {
          onSubmit: handleCreate,
          children: [
            _jsxs(DialogHeader, {
              children: [
                _jsx(DialogTitle, { children: heading }),
                _jsx(DialogDescription, { children: subheading }),
              ],
            }),
            _jsxs("div", {
              className: "grid gap-4 my-8",
              children: [
                _jsx(Label, { htmlFor: "name", children: "Project name" }),
                _jsx(Input, {
                  id: "name",
                  className: "border p-2 rounded w-full",
                  placeholder: "Project name",
                  value: name,
                  onChange: (e) => setName(e.target.value),
                  autoComplete: "off",
                  autoFocus: true,
                }),
                _jsx(Label, {
                  htmlFor: "description",
                  children: "Project Description",
                }),
                _jsx(Textarea, {
                  id: "description",
                  className: "border p-2 rounded w-full",
                  placeholder: "Description (optional)",
                  value: description,
                  onChange: (e) => setDescription(e.target.value),
                  autoComplete: "off",
                }),
              ],
            }),
            _jsxs(DialogFooter, {
              children: [
                _jsx(DialogClose, {
                  asChild: true,
                  children: _jsx(Button, {
                    variant: "outline",
                    children: "Cancel",
                  }),
                }),
                _jsx(Button, {
                  type: "submit",
                  disabled: isSubmitDisabled,
                  children: "Create Project",
                }),
              ],
            }),
          ],
        }),
      }),
    ],
  });
}
