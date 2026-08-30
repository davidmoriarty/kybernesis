// client/src/components/projects/detail/sections/TasksSection.tsx

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateTask, useUpdateTaskStatus } from "@/hooks/tasks";

type TaskStatus = "todo" | "in_progress" | "done";

interface TaskUser {
  id: string;
  name: string | null;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedToUserId: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  assignedToUser: TaskUser | null;
  createdByUser: TaskUser;
}

interface TasksSectionProps {
  projectId: string;
  tasks?: Task[];
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "Todo" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

function TaskColumn({
  id,
  children,
  className,
}: {
  id: TaskStatus;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={[className, isOver ? "ring-2 ring-primary/40" : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function DraggableTaskCard({
  taskId,
  children,
  className,
}: {
  taskId: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: taskId,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 50 : undefined,
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      data-dragging={isDragging}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

function TaskCardBody({
  task,
  columnLabel,
  updateStatus,
}: {
  task: Task;
  columnLabel: string;
  updateStatus: ReturnType<typeof useUpdateTaskStatus>;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {columnLabel}
        </span>

        <p className="font-semibold">{task.title}</p>

        {task.description ? (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {task.description}
          </p>
        ) : null}
      </div>

      <select
        value={task.status}
        disabled={updateStatus.isPending}
        onChange={(e) =>
          updateStatus.mutate({
            taskId: task.id,
            status: e.target.value as TaskStatus,
          })
        }
        className="w-full rounded-md border bg-background px-2 py-1 text-sm"
      >
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <div className="space-y-1 text-xs text-muted-foreground">
        <p>
          Assigned to:{" "}
          {task.assignedToUser?.name ||
            task.assignedToUser?.email ||
            "Unassigned"}
        </p>
        <p>Created by: {task.createdByUser.name || task.createdByUser.email}</p>
      </div>
    </div>
  );
}

export function TasksSection({ projectId, tasks }: TasksSectionProps) {
  const createTask = useCreateTask(projectId);
  const updateStatus = useUpdateTaskStatus(projectId);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  const activeTask = useMemo(
    () => tasks?.find((task) => task.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveTaskId(null);
      return;
    }

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks?.find((t) => t.id === taskId);
    if (!task) {
      setActiveTaskId(null);
      return;
    }

    if (task.status !== newStatus) {
      updateStatus.mutate({
        taskId,
        status: newStatus,
      });
    }

    setActiveTaskId(null);
  }

  function handleCreateTask() {
    const title = newTaskTitle.trim();
    if (!title) return;

    createTask.mutate(
      { title },
      {
        onSuccess: () => {
          setNewTaskTitle("");
          setIsCreateDialogOpen(false);
        },
      },
    );
  }

  if (!tasks) {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column.key} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{column.label}</h2>
              <Skeleton className="h-5 w-8" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={`${column.key}-${i}`} className="space-y-3 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    todo: tasks.filter((task) => task.status === "todo"),
    in_progress: tasks.filter((task) => task.status === "in_progress"),
    done: tasks.filter((task) => task.status === "done"),
  };

  const hasTasks = tasks.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>
            Track work across todo, in progress, and done.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">New Task</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create task</DialogTitle>
                <DialogDescription>
                  Add a new task to this project.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTask();
                    }
                  }}
                  placeholder="Task title"
                  autoFocus
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  disabled={createTask.isPending || !newTaskTitle.trim()}
                  onClick={handleCreateTask}
                >
                  {createTask.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {!hasTasks ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <p className="text-sm font-medium">No tasks yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first task to start tracking work in this project.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {COLUMNS.map((column) => {
              const columnTasks = tasksByStatus[column.key];

              return (
                <TaskColumn
                  key={column.key}
                  id={column.key}
                  className="flex flex-col rounded-lg border bg-card"
                >
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="text-base font-bold">{column.label}</h2>
                    <span className="text-base font-black text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>

                  <div className="divide-y">
                    {columnTasks.length === 0 ? (
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">
                          No tasks in {column.label.toLowerCase()}.
                        </p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <DraggableTaskCard
                          key={task.id}
                          taskId={task.id}
                          className="relative z-0 cursor-pointer transition hover:shadow-md data-[dragging=true]:z-50 data-[dragging=true]:scale-[1.02] data-[dragging=true]:opacity-50"
                        >
                          <TaskCardBody
                            task={task}
                            columnLabel={column.label}
                            updateStatus={updateStatus}
                          />
                        </DraggableTaskCard>
                      ))
                    )}
                  </div>
                </TaskColumn>
              );
            })}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-[320px] rotate-1 opacity-95 shadow-xl">
                <TaskCardBody
                  task={activeTask}
                  columnLabel={
                    COLUMNS.find((column) => column.key === activeTask.status)
                      ?.label ?? "Task"
                  }
                  updateStatus={updateStatus}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
