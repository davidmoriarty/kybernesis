// client/src/hooks/workspaces.ts
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";

export type WorkspaceSummary = {
  workspace: { id: string; name: string; role: "admin" | "member" };
  counts: {
    members: number;
    activeProjects: number;
    completedProjects: number;
  };
  members: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "member";
    status: "online" | "offline";
    lastSeenAt: string | null;
  }[];
  recentProjects: { id: string; name: string; updatedAt: string }[];
};

// --- Workspaces hooks ---

export function useWorkspaces(
  options?: Partial<
    UseQueryOptions<{
      workspaces: { id: string; name: string; description?: string }[];
    }>
  >,
) {
  return useQuery<{
    workspaces: { id: string; name: string; description?: string }[];
  }>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await rpc.$get("/workspaces", { credentials: "include" });
      return parseOrThrow(res, { workspaces: [] });
    },
    staleTime: 0,
    refetchOnMount: true,
    ...options,
  });
}

export function useSelectWorkspace() {
  const qc = useQueryClient();

  return useMutation<
    { message: string; success: boolean },
    Error,
    { workspaceId: string }
  >({
    mutationFn: async (body) => {
      const res = await rpc.$post("/workspaces/select", {
        body,
        credentials: "include",
      });
      return parseOrThrow<{ message: string; success: boolean }>(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useWorkspaceSummary(enabled = true) {
  return useQuery({
    queryKey: ["workspaceSummary"],
    enabled,
    queryFn: async () => {
      const res = await rpc.$get("/workspaces/summary", {
        credentials: "include",
      });
      return parseOrThrow<WorkspaceSummary>(res);
    },
    retry: false,
  });
}
