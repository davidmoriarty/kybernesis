// FileViewerPanel.tsx
import { getFileViewerKind } from "@shared";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectFile, useProjectFileContent } from "@/hooks/useProjectFiles";

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

  function handleBack() {
    void navigate({
      to: "/projects/$projectId",
      params: { projectId },
      search: {
        section: "Files",
        fileId: undefined,
      },
    });
  }

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
      <div className="flex items-center justify-between border-b p-4">
        <Button type="button" variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Files
        </Button>

        <h3 className="min-w-0 flex-1 truncate text-right font-medium">
          {projectFile.name}
        </h3>
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
          <pre className="max-h-[70vh] overflow-auto p-4 text-sm">
            <code>{contentQuery.data.content}</code>
          </pre>
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
        <iframe
          src={openUrl}
          title={projectFile.name}
          className="h-[70vh] w-full"
        />
      ) : viewerKind === "blocked" ? (
        <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="font-medium">File type blocked</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This file type cannot be previewed in Kybernesis for security
            reasons.
          </p>
          <Button type="button" variant="outline" onClick={handleBack}>
            Back to Files
          </Button>
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
    </Card>
  );
}
