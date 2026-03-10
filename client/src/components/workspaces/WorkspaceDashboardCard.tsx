// client/src/components/workspace/WorkspaceDashboardCard.tsx
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WorkspaceDashboardCardProps {
  title: string;
  description?: string;
  colHeaders: string[];
  footer?: ReactNode;
  children: ReactNode;
}

export function WorkspaceDashboardCard({
  title,
  description,
  colHeaders,
  footer,
  children,
}: WorkspaceDashboardCardProps) {
  const columns = colHeaders.length;
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
  };

  return (
    <Card className="w-full mx-auto px-3">
      <CardHeader className="py-2">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="w-full mx-auto text-center">
        <div className="grid gap-4" style={gridStyle}>
          {colHeaders.map((h) => (
            <div key={h}>{h}</div>
          ))}
        </div>

        <div className="py-2">
          <Separator />
        </div>

        <div className="w-full mx-auto text-center">{children}</div>
      </CardContent>

      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  );
}
