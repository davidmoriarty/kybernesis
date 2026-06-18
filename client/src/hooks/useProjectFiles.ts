// client/src/hooks/useProjectFiles.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import type { RpcError } from "@/lib/rpcError";
import { appToast } from "@/lib/toast";

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
      appToast.files.uploadSuccess();
    },

    onError: () => {
      appToast.files.uploadError();
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

      appToast.files.deleteSuccess();
    },

    onError: () => {
      appToast.files.deleteError();
    },
  });
}

export type ProjectFileContent = {
  file: Pick<ProjectFile, "id" | "name" | "mimeType" | "size" | "created_at">;
  content: string;
};

export function useProjectFileContent(
  projectId: string,
  fileId?: string,
  enabled = true,
) {
  return useQuery<ProjectFileContent, RpcError>({
    queryKey: ["projectFileContent", projectId, fileId],
    retry: false,
    enabled: Boolean(fileId) && enabled,
    queryFn: async () => {
      const res = await rpc.$get(
        `/projects/${projectId}/files/${fileId}/content`,
        {
          credentials: "include",
        },
      );

      return parseOrThrow(res);
    },
  });
}

export function useProjectFile(projectId: string, fileId?: string) {
  const query = useProjectFiles(projectId);

  return {
    ...query,
    data: query.data?.files.find((file) => file.id === fileId),
  };
}

type UpdateProjectFileContentBody = {
  fileId: string;
  content: string;
};

export function useUpdateProjectFileContent(projectId: string) {
  const qc = useQueryClient();

  return useMutation<
    { success: boolean },
    RpcError,
    UpdateProjectFileContentBody
  >({
    mutationFn: async ({ fileId, content }) => {
      const res = await rpc.$put(
        `/projects/${projectId}/files/${fileId}/content`,
        {
          body: { content },
          credentials: "include",
        },
      );

      return parseOrThrow(res);
    },

    onSuccess: async (_data, { fileId }) => {
      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["projectFileContent", projectId, fileId],
        }),
        qc.invalidateQueries({
          queryKey: ["projectFiles", projectId],
        }),
        qc.invalidateQueries({
          queryKey: ["project-events", projectId],
        }),
      ]);

      appToast.files.saveSuccess();
    },

    onError: () => {
      appToast.files.saveError();
    },
  });
}
