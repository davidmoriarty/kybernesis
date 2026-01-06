// client/src/hooks/projects.ts
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

// --- Projects hooks ---
export function useProjects() {
  return useQuery<{
    projects: { id: number; name: string; description?: string }[];
  }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await rpc.projects.$get();
      return parseOrThrow(res);
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation<
    { message: string }, // type of data returned by the server
    Error,
    { name: string; description?: string } // variables you pass in
  >({
    mutationFn: async (body) => {
      const res = await rpc.projects.$post({ body });
      return parseOrThrow<{ message: string }>(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
