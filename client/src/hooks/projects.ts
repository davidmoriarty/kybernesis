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

    onSuccess: async (_, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["projects"] }),
        qc.invalidateQueries({
          queryKey: ["projects", variables.projectId],
        }),
        qc.invalidateQueries({
          queryKey: ["project-events", variables.projectId],
        }),
      ]);
    },

    onError: () => {
      appToast.projects.updateError();
    },
  });
}

export function useProjectEvents(projectId: string) {
  return useQuery({
    queryKey: ["project-events", projectId],
    queryFn: async () => {
      const res = await rpc.$get(`/projects/${projectId}/events`);

      if (!res.ok) {
        throw new Error("Failed to fetch project events");
      }

      return res.json() as Promise<{
        events: {
          id: string;
          actorName: string | null;
          actorEmail: string | null;
          eventType: string;
          payload: Record<string, unknown>;
          created_at: string;
        }[];
      }>;
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

    onSuccess: async (_, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["projects"] }),
        qc.invalidateQueries({
          queryKey: ["project-events", variables.projectId],
        }),
      ]);

      appToast.projects.deleteSuccess();
    },

    onError: () => {
      appToast.projects.deleteError();
    },
  });
}
