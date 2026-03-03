import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
// --- Workspaces hooks ---
export function useWorkspaces(options) {
  return useQuery({
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
  return useMutation({
    mutationFn: async (body) => {
      const res = await rpc.$post("/workspaces/select", {
        body,
        credentials: "include",
      });
      return parseOrThrow(res);
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
      return parseOrThrow(res);
    },
    retry: false,
  });
}
