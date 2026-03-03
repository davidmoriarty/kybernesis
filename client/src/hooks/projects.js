import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import { appToast } from "@/lib/toast";
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await rpc.$get("/projects", { credentials: "include" });
      return parseOrThrow(res, { projects: [] });
    },
  });
}
export function useProject(projectId) {
  return useQuery({
    queryKey: ["projects", projectId],
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
  return useMutation({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$post("/projects", {
        body,
        credentials: "include",
      });
      return parseOrThrow(res, {
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
  return useMutation({
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
      appToast.projects.updateSuccess();
    },
    onError: () => {
      appToast.projects.updateError();
    },
  });
}
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
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
