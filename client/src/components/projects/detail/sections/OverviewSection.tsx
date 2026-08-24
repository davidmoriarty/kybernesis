// client/src/components/projects/detail/sections/OverviewSection.tsx
import { Card } from "@/components/ui/card";
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

  return (
    <Card>
      {info.map((item) => (
        <div key={item.label} className="flex flex-col gap-2 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {item.label}
          </p>

          <p className="text-base font-medium text-foreground">
            {item.value || "—"}
          </p>
        </div>
      ))}
    </Card>
  );
}
