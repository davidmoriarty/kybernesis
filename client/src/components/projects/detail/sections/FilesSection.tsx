// client/src/components/projects/detail/sections/FilesSection.tsx

import { EllipsisVertical, FolderOpen, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIcon } from "@/components/projects/detail/sections/files/getFileIcon";
import {
  type ProjectFile,
  useDeleteProjectFile,
  useProjectFiles,
  useUploadProjectFile,
  useRenameProjectFile,
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
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const renameMutation = useRenameProjectFile(projectId);
  const [renameFile, setRenameFile] = useState<ProjectFile | null>(null);
  const [renameValue, setRenameValue] = useState("");

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

  async function handleOpen(projectFile: ProjectFile) {
    await navigate({
      to: "/projects/$projectId",
      params: { projectId },
      search: {
        section: "Files",
        fileId: projectFile.id,
      },
    });
  }

  function openRenameDialog(projectFile: ProjectFile) {
    setRenameFile(projectFile);
    setRenameValue(projectFile.name);
  }

  function closeRenameDialog() {
    setRenameFile(null);
    setRenameValue("");
  }

  async function handleRename() {
    if (!renameFile) return;

    const name = renameValue.trim();

    if (!name || name === renameFile.name) {
      closeRenameDialog();
      return;
    }

    await renameMutation.mutateAsync({
      fileId: renameFile.id,
      name,
    });

    closeRenameDialog();
  }

  async function handleDelete(fileId: string) {
    await deleteMutation.mutateAsync({ fileId });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Project Files</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Upload and manage files for this project.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-row items-center justify-start gap-4 mb-2">
            <Upload />
            Upload a file
          </CardTitle>
          <CardDescription>
            Add documents, images, exports, or project assets.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
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
            className="w-full sm:w-40"
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
        </CardContent>
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
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Files</h3>
            <span className="text-sm text-muted-foreground">
              {data.files.length} {data.files.length === 1 ? "file" : "files"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.files.map((projectFile) => {
              const FileIcon = getFileIcon(projectFile.name);

              return (
                <Card
                  key={projectFile.id}
                  className="flex flex-col gap-3 p-5 sm:p-6"
                >
                  <div className="min-w-0">
                    <div className="wrap-break-word font-medium">
                      {projectFile.name}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg border bg-background p-2">
                        <FileIcon className="size-5 text-muted-foreground" />
                      </div>

                      <span className="rounded-md border px-2 py-0.5 text-[10px] font-medium">
                        {getFileExtension(projectFile.name)}
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-md"
                          className="shrink-0"
                        >
                          <EllipsisVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => void handleOpen(projectFile)}
                        >
                          Open
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDownload(projectFile.id)}
                        >
                          Download
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => openRenameDialog(projectFile)}
                        >
                          Rename
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => setDeleteFileId(projectFile.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                    <span>{formatBytes(projectFile.size)}</span>
                    <span>{formatDate(projectFile.created_at)}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={Boolean(renameFile)}
        onOpenChange={(open) => {
          if (!open) {
            closeRenameDialog();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Update the display name for this project file.
            </DialogDescription>
          </DialogHeader>

          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleRename();
              }
            }}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeRenameDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={renameMutation.isPending}
              onClick={() => void handleRename()}
            >
              {renameMutation.isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteFileId)}
        title="Delete file?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onOpenChange={(open) => {
          if (!open) {
            setDeleteFileId(null);
          }
        }}
        onConfirm={async () => {
          if (!deleteFileId) return;

          await handleDelete(deleteFileId);
          setDeleteFileId(null);
        }}
      />
    </div>
  );
}
