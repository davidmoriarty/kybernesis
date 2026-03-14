// client/src/components/projects/detail/sections/OverviewSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formatDate";

interface OverviewSectionProps {
  projectName: string;
  description?: string;
  createdAt?: string;
}

export function OverviewSection({
  projectName,
  description,
  createdAt,
}: OverviewSectionProps) {
  const formattedCreatedAt = createdAt ? formatDate(createdAt) : undefined;

  const info = [
    { label: "Project Name", value: projectName },
    { label: "Description", value: description },
    { label: "Created", value: formattedCreatedAt },
  ];

  if (!projectName && !description && !createdAt) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {info.map((item) => (
        <Card key={item.label} className="p-4 flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>
          <p className="font-medium text-base text-foreground">
            {item.value || "—"}
          </p>
        </Card>
      ))}
    </div>
  );
}
