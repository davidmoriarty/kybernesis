// components/FormDialog.tsx
import type { Project } from "@shared";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, type SyntheticEvent } from "react";
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
import { isProjectValidation } from "@/lib/validation";

interface FormDialogProps {
  cta?: string;
  heading?: string;
  subheading?: string;
}

type ProjectsData = {
  projects: Project[];
};

export function FormDialog({ cta, heading, subheading }: FormDialogProps) {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: me } = useMe();
  const createProject = useCreateProject();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const isSubmitDisabled =
    createProject.isPending || !me?.workspace || !name.trim();

  const handleCreate = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setNameError("");
    setDescriptionError("");

    if (!me?.workspace) {
      toast.error("No active workspace selected.");
      return;
    }

    if (!name.trim()) {
      setNameError("Project name is required.");
      return;
    }

    const workspaceId = me.workspace.id;

    const tempId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const optimistic: Project = {
      id: tempId,
      workspaceId,
      name,
      description,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // Optimistically add project to the query cache
    qc.setQueryData<ProjectsData>(["projects"], (oldData) => {
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

      if (isProjectValidation(result)) {
        qc.setQueryData<ProjectsData>(["projects"], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            projects: oldData.projects.filter((p) => p.id !== tempId),
          };
        });

        setNameError(result.errors.name ?? "");
        setDescriptionError(result.errors.description ?? "");
        return;
      }

      // Close form and reset fields
      setName("");
      setDescription("");
      setNameError("");
      setDescriptionError("");
      setOpen(false);

      // Replace temp project with real project in the cache
      qc.setQueryData<ProjectsData>(["projects"], (oldData) => {
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
      qc.setQueryData<ProjectsData>(["projects"], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          projects: oldData.projects.filter((p) => p.id !== tempId),
        };
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center justify-center">
          <Button variant="default" size="lg">
            {cta}
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>{heading}</DialogTitle>
            <DialogDescription>{subheading}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 my-8">
            <Label htmlFor="name">Project name</Label>
            <Input
              id="name"
              className="border p-2 rounded w-full"
              placeholder="Project name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError("");
              }}
              autoComplete="off"
              autoFocus={true}
            />
            {nameError ? (
              <p className="text-sm text-destructive">{nameError}</p>
            ) : null}

            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              className="border p-2 rounded w-full"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError("");
              }}
              autoComplete="off"
            />
            {descriptionError ? (
              <p className="text-sm text-destructive">{descriptionError}</p>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitDisabled}>
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
