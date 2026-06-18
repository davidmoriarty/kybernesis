// client/src/components/shared/StatusBadge.tsx

import { Badge } from "@/components/ui/badge";

type StatusTone = "neutral" | "info" | "success" | "warning" | "danger";

interface StatusBadgeProps {
  tone?: StatusTone;
  children: React.ReactNode;
}

const toneClasses: Record<StatusTone, string> = {
  neutral: "border-border bg-background text-muted-foreground",

  info: "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",

  success:
    "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",

  warning:
    "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",

  danger:
    "border-destructive-200 bg-destructive-100 text-destructive-700 dark:border-destructive-800 dark:bg-destructive-950 dark:text-destructive-300",
};

export function StatusBadge({ tone = "neutral", children }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={`px-3 py-1.5 ${toneClasses[tone]}`}>
      {children}
    </Badge>
  );
}
