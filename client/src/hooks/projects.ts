// client/src/hooks/projects.ts
import type { Project } from "@shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import { appToast } from "@/lib/toast";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await rpc.$get("/projects");
      return parseOrThrow<{
        projects: { id: string; name: string; description?: string }[];
      }>(res, { projects: [] });
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const res = await rpc.$get(`/projects/${projectId}`);
      return parseOrThrow<{
        id: string;
        name: string;
        description?: string;
        workspaceId: string;
        owner: string;
        createdAt: string;
        updatedAt: string;
      }>(res);
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation<
    { project: Project },
    Error,
    {
      name: string;
      description?: string;
      workspaceId: string;
    }
  >({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$post("/projects", { body });
      return parseOrThrow<{ project: Project }>(res, {
        project: {
          id: "",
          workspaceId: "",
          name: "",
          description: "",
          createdAt: "",
          updatedAt: "",
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      appToast.projects.createSuccess();
    },
    onError: () => {
      appToast.projects.createError();
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();

  return useMutation<
    { message: string },
    Error,
    { projectId: string; name: string; description?: string }
  >({
    retry: false,
    mutationFn: async ({ projectId, ...body }) => {
      const res = await rpc.$put(`/projects/${projectId}`, { body });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      appToast.projects.updateSuccess();
    },
    onError: () => {
      appToast.projects.updateError();
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation<{ message: string }, Error, { projectId: string }>({
    retry: false,
    mutationFn: async ({ projectId }) => {
      const res = await rpc.$delete(`/projects/${projectId}`);
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      appToast.projects.deleteSuccess();
    },
    onError: () => {
      appToast.projects.deleteError();
    },
  });
}
