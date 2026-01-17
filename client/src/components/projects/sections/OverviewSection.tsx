// @/components/projects/sections/OverviewSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface OverviewSectionProps {
  projectName: string;
  description?: string;
  owner?: string;
  createdAt?: string;
}

export default function OverviewSection({
  projectName,
  description,
  owner,
  createdAt,
}: OverviewSectionProps) {
  const info = [
    { label: "Project Name", value: projectName },
    { label: "Description", value: description },
    { label: "Owner", value: owner },
    { label: "Created At", value: createdAt },
  ];

  if (!projectName && !description && !owner && !createdAt) {
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
          <p className="text-sm text-muted-foreground">{item.label}</p>
          <p className="font-medium">{item.value || "-"}</p>
        </Card>
      ))}
    </div>
  );
}
