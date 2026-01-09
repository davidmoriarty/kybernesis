// client/src/hooks/workspaces.ts
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { rpcErrorFromResponse } from "@/lib/rpcError";

async function parseOrThrow<T>(res: Response, fallback?: T): Promise<T> {
  let body: unknown;
  try {
    body = await res.clone().json();
  } catch {
    body = undefined;
  }

  if (!res.ok) throw rpcErrorFromResponse(res, body);
  return (body ?? fallback) as T;
}

// --- Workspaces hooks ---
export function useWorkspaces(
  options?: Partial<
    UseQueryOptions<{
      workspaces: { id: number; name: string; description?: string }[];
    }>
  >,
) {
  return useQuery<{
    workspaces: { id: number; name: string; description?: string }[];
  }>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await rpc.workspaces.$get();
      return parseOrThrow(res, { workspaces: [] });
    },
    ...options,
  });
}

export function useSelectWorkspace() {
  const qc = useQueryClient();

  return useMutation<
    { workspaces: { id: number; name: string; description?: string }[] },
    Error,
    { workspaceId: number }
  >({
    mutationFn: async (body: { workspaceId: number }) => {
      const res = await rpc.workspaces.select.$post({ body });
      return parseOrThrow(res, { workspaces: [] });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
