// client/src/components/projects/detail/sections/FilesSection.tsx
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectFiles, useUploadProjectFile } from "@/hooks/useProjectFiles";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FilesSectionProps {
  projectId: string;
}

export function FilesSection({ projectId }: FilesSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data, isPending, isError } = useProjectFiles(projectId);
  const uploadMutation = useUploadProjectFile(projectId);

  async function handleFileChange(file: File | null) {
    if (!file) return;

    try {
      await uploadMutation.mutateAsync({ file });

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch {
      // handled by mutation state
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          className="text-sm"
          disabled={uploadMutation.isPending}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            void handleFileChange(file);
          }}
        />

        {uploadMutation.isPending ? (
          <span className="text-sm text-muted-foreground">Uploading...</span>
        ) : null}

        {uploadMutation.isError ? (
          <span className="text-sm text-destructive">Upload failed.</span>
        ) : null}
      </div>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-4 flex flex-col gap-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-destructive">Failed to load files.</div>
      ) : !data?.files.length ? (
        <div className="text-sm text-muted-foreground">
          No files uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.files.map((file) => (
            <Card key={file.id} className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="truncate font-medium">{file.name}</div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {formatBytes(file.size)}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                {file.mimeType}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
