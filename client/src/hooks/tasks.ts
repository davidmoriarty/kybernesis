// client/src/hooks/tasks.ts

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { appToast } from "@/lib/toast";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface TaskUser {
  id: string;
  name: string | null;
  email: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedToUserId: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  assignedToUser: TaskUser | null;
  createdByUser: TaskUser;
}

export function useProjectTasks(projectId: string) {
  return useQuery({
    queryKey: ["project-tasks", projectId],
    queryFn: async () => {
      const res = await rpc.$get(`/projects/${projectId}/tasks`, {
        credentials: "include",
      });

      return parseOrThrow<{ tasks: ProjectTask[] }>(res);
    },

    enabled: Boolean(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      assignedToUserId?: string | null;
    }) => {
      const res = await rpc.$post(`/projects/${projectId}/tasks`, {
        body: {
          title: input.title,
          description: input.description,
          assignedToUserId: input.assignedToUserId ?? null,
        },
        credentials: "include",
      });

      return parseOrThrow<{ task: ProjectTask }>(res);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["project-tasks", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["project-events", projectId],
        }),
      ]);

      appToast.tasks.createSuccess();
    },

    onError: () => {
      appToast.tasks.createError();
    },
  });
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      taskId: string;
      status: "todo" | "in_progress" | "done";
    }) => {
      const res = await rpc.$patch(`/tasks/${input.taskId}/status`, {
        body: { status: input.status },
        credentials: "include",
      });

      return parseOrThrow(res);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["project-tasks", projectId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["project-events", projectId],
        }),
      ]);

      appToast.tasks.statusUpdateSuccess();
    },

    onError: () => {
      appToast.tasks.statusUpdateError();
    },
  });
}
