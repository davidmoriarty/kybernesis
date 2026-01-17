import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FilesSectionProps {
  files?: string[];
}

export default function FilesSection({ files }: FilesSectionProps) {
  if (!files) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 flex flex-col gap-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <Card key={file} className="p-4 flex flex-col gap-2">
          <div className="h-6 w-6 rounded-full bg-accent" />
          <p className="font-medium">{file}</p>
        </Card>
      ))}
    </div>
  );
}
