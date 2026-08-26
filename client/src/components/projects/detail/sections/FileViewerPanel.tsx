// FileViewerPanel.tsx
import { getFileViewerKind } from "@shared";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProjectFile,
  useProjectFileContent,
  useUpdateProjectFileContent,
} from "@/hooks/useProjectFiles";

interface FileViewerPanelProps {
  projectId: string;
  fileId: string;
}

function getApiBaseUrl() {
  if (import.meta.env.MODE !== "development") {
    return import.meta.env.VITE_API_URL;
  }

  return `${window.location.protocol}//${window.location.hostname}:3000/api`;
}

export function FileViewerPanel({ projectId, fileId }: FileViewerPanelProps) {
  const navigate = useNavigate();
  const fileQuery = useProjectFile(projectId, fileId);
  const projectFile = fileQuery.data;
  const viewerKind = projectFile ? getFileViewerKind(projectFile) : null;
  const contentQuery = useProjectFileContent(
    projectId,
    fileId,
    viewerKind === "text",
  );
  const updateMutation = useUpdateProjectFileContent(projectId);
  const [content, setContent] = useState("");
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  useEffect(() => {
    if (viewerKind === "text" && contentQuery.data) {
      setContent(contentQuery.data.content);
    }
  }, [contentQuery.data, viewerKind]);

  const isDirty =
    viewerKind === "text" && contentQuery.data
      ? content !== contentQuery.data.content
      : false;

  const showEditorActions = viewerKind === "text" && contentQuery.data;

  const modeStatus = viewerKind === "text" && isDirty ? "Editing" : "Viewing";
  const modeTone = modeStatus === "Editing" ? "info" : "neutral";

  const saveStatus = updateMutation.isPending
    ? "Saving..."
    : isDirty
      ? "Unsaved changes"
      : showEditorActions
        ? "Saved"
        : null;

  const saveTone = updateMutation.isPending
    ? "neutral"
    : isDirty
      ? "warning"
      : "success";

  function navigateBackToFiles() {
    void navigate({
      to: "/projects/$projectId",
      params: { projectId },
      search: {
        section: "Files",
        fileId: undefined,
      },
    });
  }

  function handleBack() {
    if (isDirty) {
      setLeaveDialogOpen(true);
      return;
    }

    navigateBackToFiles();
  }

  const handleSave = useCallback(async () => {
    await updateMutation.mutateAsync({
      fileId,
      content,
    });
  }, [content, fileId, updateMutation]);

  useEffect(() => {
    if (viewerKind !== "text") return;

    function handleKeyDown(event: KeyboardEvent) {
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key === "s";

      if (!isSaveShortcut) return;

      event.preventDefault();

      if (!isDirty || updateMutation.isPending) return;

      void handleSave();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewerKind, isDirty, updateMutation.isPending, handleSave]);

  if (fileQuery.isPending) {
    return (
      <Card className="p-5 sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-80 w-full" />
        </div>
      </Card>
    );
  }

  if (fileQuery.isError || !projectFile || !viewerKind) {
    return (
      <Card className="p-5 text-sm text-destructive sm:p-6">
        Failed to load file.
      </Card>
    );
  }

  const openUrl = `${getApiBaseUrl()}/projects/${projectId}/files/${projectFile.id}/open`;
  const downloadUrl = `${getApiBaseUrl()}/projects/${projectId}/files/${projectFile.id}/download`;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b p-4">
        <div>
          <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Files
          </Button>
        </div>

        <div className="min-w-0 flex-1 text-center">
          <h3 className="truncate font-medium">{projectFile.name}</h3>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge tone={modeTone}>{modeStatus}</StatusBadge>

          {saveStatus ? (
            <StatusBadge tone={saveTone}>{saveStatus}</StatusBadge>
          ) : null}

          {showEditorActions ? (
            <Button
              type="button"
              size="sm"
              disabled={!isDirty || updateMutation.isPending}
              onClick={() => void handleSave()}
            >
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          ) : null}
        </div>
      </div>

      {viewerKind === "text" ? (
        contentQuery.isPending ? (
          <div className="p-4">
            <Skeleton className="h-80 w-full" />
          </div>
        ) : contentQuery.isError || !contentQuery.data ? (
          <div className="p-5 text-sm text-destructive sm:p-6">
            Failed to load file content.
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-[70vh] w-full resize-none border-0 bg-background p-4 font-mono text-sm outline-none"
          />
        )
      ) : viewerKind === "image" ? (
        <div className="flex max-h-[70vh] items-center justify-center overflow-auto bg-background p-4">
          <img
            src={openUrl}
            alt={projectFile.name}
            className="max-h-full max-w-full rounded-md object-contain"
          />
        </div>
      ) : viewerKind === "pdf" ? (
        <div className="w-full min-w-0 overflow-hidden bg-background">
          <iframe
            src={openUrl}
            title={projectFile.name}
            className="block h-[70vh] w-full min-w-0 border-0"
          />
        </div>
      ) : viewerKind === "blocked" ? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium">File type blocked</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This file type cannot be previewed in Kybernesis for security
            reasons.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium">Preview unavailable</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This file type cannot be previewed in Kybernesis yet. You can still
            download it.
          </p>
          <Button asChild variant="outline">
            <a href={downloadUrl}>Download file</a>
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={leaveDialogOpen}
        title="Leave without saving?"
        description="You have unsaved changes. If you leave now, your changes will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        tone="danger"
        onOpenChange={setLeaveDialogOpen}
        onConfirm={() => {
          setLeaveDialogOpen(false);
          navigateBackToFiles();
        }}
      />
    </Card>
  );
}
