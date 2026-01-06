// client/src/hooks/workspaces.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { rpcErrorFromResponse } from "@/lib/rpcError";

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res
    .clone()
    .json()
    .catch(() => undefined);
  if (!res.ok) throw rpcErrorFromResponse(res, body);
  return body as T;
}

// --- Workspaces hooks ---
export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await rpc.workspaces.$get();
      return parseOrThrow(res);
    },
  });
}

export function useSelectWorkspace() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: { workspaceId: number }) => {
      const res = await rpc.workspaces.select.$post({ body });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
``;
