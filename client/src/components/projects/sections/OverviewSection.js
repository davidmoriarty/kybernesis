import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @/components/projects/sections/OverviewSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export default function OverviewSection({
  projectName,
  description,
  owner,
  createdAt,
}) {
  const info = [
    { label: "Project Name", value: projectName },
    { label: "Description", value: description },
    { label: "Owner", value: owner },
    { label: "Created At", value: createdAt },
  ];
  if (!projectName && !description && !owner && !createdAt) {
    return _jsx("div", {
      className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
      children: [1, 2, 3].map((i) =>
        _jsxs(
          Card,
          {
            className: "p-4 flex flex-col gap-2",
            children: [
              _jsx(Skeleton, { className: "h-4 w-3/4" }),
              _jsx(Skeleton, { className: "h-3 w-full" }),
              _jsx(Skeleton, { className: "h-3 w-full" }),
            ],
          },
          i,
        ),
      ),
    });
  }
  return _jsx("div", {
    className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
    children: info.map((item) =>
      _jsxs(
        Card,
        {
          className: "p-4 flex flex-col gap-2",
          children: [
            _jsx("p", {
              className: "text-sm text-muted-foreground",
              children: item.label,
            }),
            _jsx("p", {
              className: "font-medium",
              children: item.value || "-",
            }),
          ],
        },
        item.label,
      ),
    ),
  });
}
