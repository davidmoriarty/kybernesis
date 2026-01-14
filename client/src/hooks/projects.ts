// client/src/hooks/projects.ts
import type { UseQueryOptions } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";

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
      const res = await rpc.$get("/projects");
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
      const res = await rpc.$post("/projects", { body });
      return parseOrThrow<{ message: string }>(res, { message: "" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
