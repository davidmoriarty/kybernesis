// client/src/components/projects/sections/TasksSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Task {
  title: string;
  status?: "Todo" | "In Progress" | "Done";
}

interface TasksSectionProps {
  tasks?: Task[];
}

export default function TasksSection({ tasks }: TasksSectionProps) {
  // Skeleton loading state
  if (!tasks) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 flex flex-col gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.title} className="p-4 flex flex-col gap-2">
          <p className="font-medium">{task.title}</p>
          {task.status && (
            <span className="text-sm text-muted-foreground">{task.status}</span>
          )}
        </Card>
      ))}
    </div>
  );
}
