// client/src/hooks/workspaces.ts
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";

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
      const res = await rpc.$get("/workspaces");
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
    { workspaces: { id: string; name: string; description?: string }[] },
    Error,
    { workspaceId: string }
  >({
    mutationFn: async (body: { workspaceId: string }) => {
      const res = await rpc.$post("/workspaces", { body });
      return parseOrThrow(res, { workspaces: [] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
