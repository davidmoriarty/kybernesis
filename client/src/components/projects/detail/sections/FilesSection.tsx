// client/src/components/projects/detail/sections/FilesSection.tsx
import { File, FolderOpen, Upload } from "lucide-react";
import { useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteProjectFile,
  useProjectFiles,
  useUploadProjectFile,
} from "@/hooks/useProjectFiles";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toUpperCase() ?? "FILE") : "FILE";
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

interface FilesSectionProps {
  projectId: string;
}

export function FilesSection({ projectId }: FilesSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { data, isPending, isError } = useProjectFiles(projectId);
  const uploadMutation = useUploadProjectFile(projectId);
  const deleteMutation = useDeleteProjectFile(projectId);
  const navigate = useNavigate();

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

  function getApiBaseUrl() {
    if (import.meta.env.MODE !== "development") {
      return import.meta.env.VITE_API_URL;
    }

    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  }

  function handleDownload(fileId: string) {
    window.location.href = `${getApiBaseUrl()}/projects/${projectId}/files/${fileId}/download`;
  }

  async function handleOpen(fileId: string) {
    await navigate({
      to: "/projects/$projectId",
      params: { projectId },
      search: {
        section: "Files",
        fileId,
      },
    });
  }

  async function handleDelete(fileId: string) {
    const confirmed = window.confirm("Delete this file?");

    if (!confirmed) return;

    await deleteMutation.mutateAsync({ fileId });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Project Files</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Upload and manage files for this project.
        </p>
      </header>

      <Card className="flex flex-col items-center justify-center gap-4 p-5 text-center sm:p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-lg border bg-background p-2">
            <Upload className="size-5 text-muted-foreground" />
          </div>

          <div className="space-y-1">
            <h3 className="font-medium">Upload a file</h3>
            <p className="text-sm text-muted-foreground">
              Add documents, images, exports, or project assets.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            disabled={uploadMutation.isPending}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleFileChange(file);
            }}
          />

          <Button
            type="button"
            disabled={uploadMutation.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </Button>

          <span className="text-sm text-muted-foreground">
            {uploadMutation.isPending ? "Uploading..." : "No file selected"}
          </span>

          {uploadMutation.isError ? (
            <span className="text-sm text-destructive">Upload failed.</span>
          ) : null}
        </div>
      </Card>

      {isPending ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="flex flex-col gap-3 p-5 sm:p-6">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-5 text-sm text-destructive sm:p-6">
          Failed to load files.
        </Card>
      ) : !data?.files.length ? (
        <Card className="flex flex-col items-center justify-center gap-3 p-5 text-center sm:p-6">
          <div className="rounded-full border bg-background p-4">
            <FolderOpen className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">No files uploaded yet</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Upload the first file to get started.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.files.map((projectFile) => (
            <Card
              key={projectFile.id}
              className="flex flex-col gap-3 p-5 sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg border bg-background p-2">
                  <File className="size-5 text-muted-foreground" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{projectFile.name}</div>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border px-2 py-0.5 text-[10px] font-medium">
                      {getFileExtension(projectFile.name)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                <div className="flex flex-col gap-1">
                  <span>{formatBytes(projectFile.size)}</span>
                  <span>{formatDate(projectFile.created_at)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleOpen(projectFile.id)}
                  >
                    Open
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(projectFile.id)}
                  >
                    Download
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => void handleDelete(projectFile.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
