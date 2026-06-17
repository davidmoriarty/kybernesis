import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectFileContent } from "@/hooks/useProjectFiles";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

interface FileViewerPanelProps {
  projectId: string;
  fileId: string;
}

export function FileViewerPanel({ projectId, fileId }: FileViewerPanelProps) {
  const navigate = useNavigate();
  const { data, isPending, isError } = useProjectFileContent(projectId, fileId);

  if (isPending) {
    return (
      <Card className="p-5 sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-80 w-full" />
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="p-5 text-sm text-destructive sm:p-6">
        Failed to load file content.
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b p-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            void navigate({
              to: "/projects/$projectId",
              params: { projectId },
              search: {
                section: "Files",
                fileId: undefined,
              },
            });
          }}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Files
        </Button>

        <h3 className="min-w-0 flex-1 truncate text-right font-medium">
          {data.file.name}
        </h3>
      </div>

      <pre className="max-h-[70vh] overflow-auto p-4 text-sm">
        <code>{data.content}</code>
      </pre>
    </Card>
  );
}
