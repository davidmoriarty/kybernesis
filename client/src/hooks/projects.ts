// client/src/hooks/projects.ts
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

// --- Projects hooks ---

export function useProjects(
  options?: Partial<
    UseQueryOptions<{
      projects: { id: number; name: string; description?: string }[];
    }>
  >,
) {
  return useQuery<{
    projects: { id: number; name: string; description?: string }[];
  }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await rpc.projects.$get();
      return parseOrThrow(res, { projects: [] });
    },
    ...options,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation<
    { message: string },
    Error,
    {
      name: string;
      description?: string;
      workspaceId: number;
    }
  >({
    mutationFn: async (body) => {
      const res = await rpc.projects.$post({ body });
      return parseOrThrow<{ message: string }>(res, { message: "" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
