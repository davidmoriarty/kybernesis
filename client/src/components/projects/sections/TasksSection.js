import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/components/projects/sections/TasksSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export default function TasksSection({ tasks }) {
  // Skeleton loading state
  if (!tasks) {
    return _jsx("div", {
      className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
      children: [1, 2, 3, 4].map((i) =>
        _jsxs(
          Card,
          {
            className: "p-4 flex flex-col gap-2",
            children: [
              _jsx(Skeleton, { className: "h-5 w-3/4" }),
              _jsx(Skeleton, { className: "h-4 w-full" }),
            ],
          },
          i,
        ),
      ),
    });
  }
  return _jsx("div", {
    className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    children: tasks.map((task) =>
      _jsxs(
        Card,
        {
          className: "p-4 flex flex-col gap-2",
          children: [
            _jsx("p", { className: "font-medium", children: task.title }),
            task.status &&
              _jsx("span", {
                className: "text-sm text-muted-foreground",
                children: task.status,
              }),
          ],
        },
        task.title,
      ),
    ),
  });
}
