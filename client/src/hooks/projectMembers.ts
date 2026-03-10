import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import type { RpcError } from "@/lib/rpcError";

export interface ProjectMember {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "member";
}

type AddProjectMemberBody = {
  email: string;
};

type RemoveProjectMemberBody = {
  userId: string;
};

export function useProjectMembers(projectId: string) {
  return useQuery<{ members: ProjectMember[] }, RpcError>({
    queryKey: ["projectMembers", projectId],
    retry: false,
    queryFn: async () => {
      const res = await rpc.$get(`/projects/${projectId}/members`, {
        credentials: "include",
      });
      return parseOrThrow(res);
    },
  });
}

export function useAddProjectMember(projectId: string) {
  const qc = useQueryClient();

  return useMutation<{ message: string }, RpcError, AddProjectMemberBody>({
    mutationFn: async (body) => {
      const res = await rpc.$post(`/projects/${projectId}/members/by-email`, {
        body,
        credentials: "include",
      });
      return parseOrThrow(res);
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
    },
  });
}

export function useRemoveProjectMember(projectId: string) {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, RpcError, RemoveProjectMemberBody>({
    mutationFn: async ({ userId }) => {
      const res = await rpc.$delete(
        `/projects/${projectId}/members/${userId}`,
        {
          credentials: "include",
        },
      );
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
    },
  });
}
