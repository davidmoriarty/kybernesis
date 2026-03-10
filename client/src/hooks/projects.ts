// client/src/hooks/projects.ts
import type { Project, ProjectValidation } from "@shared";
import { isProjectValidation } from "@/lib/validation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import type { RpcError } from "@/lib/rpcError";
import { appToast } from "@/lib/toast";

type ProjectCreateBody = {
  name: string;
  description?: string;
  workspaceId: string;
};

export function useProjects() {
  return useQuery<{ projects: Project[] }, RpcError>({
    queryKey: ["projects"],
    retry: false,
    queryFn: async () => {
      const res = await rpc.$get("/projects", { credentials: "include" });
      return parseOrThrow(res, { projects: [] });
    },
  });
}

export function useProject(projectId: string) {
  return useQuery<Project, RpcError>({
    queryKey: ["projects", projectId],
    retry: false,
    queryFn: async () => {
      const res = await rpc.$get(`/projects/${projectId}`, {
        credentials: "include",
      });
      return parseOrThrow(res);
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation<
    { project: Project } | ProjectValidation,
    RpcError,
    ProjectCreateBody
  >({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$post("/projects", {
        body,
        credentials: "include",
      });

      // 201 -> { project }, 422 -> { errors }
      return parseOrThrow<{ project: Project } | ProjectValidation>(res);
    },
    onSuccess: (data) => {
      if (isProjectValidation(data)) return;

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
    RpcError,
    {
      projectId: string;
      name?: string;
      description?: string;
      status?: "development" | "live";
      notificationsEnabled?: boolean;
      isPublic?: boolean;
    }
  >({
    retry: false,
    mutationFn: async ({ projectId, ...body }) => {
      const res = await rpc.$put(`/projects/${projectId}`, {
        body,
        credentials: "include",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: () => {
      appToast.projects.updateError();
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation<{ message: string }, RpcError, { projectId: string }>({
    retry: false,
    mutationFn: async ({ projectId }) => {
      const res = await rpc.$delete(`/projects/${projectId}`, {
        credentials: "include",
      });
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
