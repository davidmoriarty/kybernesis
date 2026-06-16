// client/src/hooks/useProjectFiles.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import type { RpcError } from "@/lib/rpcError";

export type ProjectFile = {
  id: string;
  projectId: string;
  uploadedByUserId: string;
  name: string;
  size: number;
  mimeType: string;
  storageKey: string;
  created_at: string;
};

export function useProjectFiles(projectId: string) {
  return useQuery<{ files: ProjectFile[] }, RpcError>({
    queryKey: ["projectFiles", projectId],
    retry: false,
    queryFn: async () => {
      const res = await rpc.$get(`/projects/${projectId}/files`, {
        credentials: "include",
      });
      return parseOrThrow(res);
    },
  });
}

type UploadProjectFileBody = {
  file: File;
};

export function useUploadProjectFile(projectId: string) {
  const qc = useQueryClient();

  return useMutation<{ file: ProjectFile }, RpcError, UploadProjectFileBody>({
    mutationFn: async ({ file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await rpc.$post(`/projects/${projectId}/files`, {
        body: formData,
        credentials: "include",
      });

      return parseOrThrow(res);
    },

    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["projectFiles", projectId],
      });
    },
  });
}

type DeleteProjectFileBody = {
  fileId: string;
};

export function useDeleteProjectFile(projectId: string) {
  const qc = useQueryClient();

  return useMutation<{ success: boolean }, RpcError, DeleteProjectFileBody>({
    mutationFn: async ({ fileId }) => {
      const res = await rpc.$delete(`/projects/${projectId}/files/${fileId}`, {
        credentials: "include",
      });

      return parseOrThrow(res);
    },

    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["projectFiles", projectId],
        }),
        qc.invalidateQueries({
          queryKey: ["project-events", projectId],
        }),
      ]);
    },
  });
}
