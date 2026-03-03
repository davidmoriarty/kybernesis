import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export default function FilesSection({ files }) {
  if (!files) {
    return _jsx("div", {
      className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
      children: [1, 2, 3, 4, 5].map((i) =>
        _jsxs(
          Card,
          {
            className: "p-4 flex flex-col gap-2",
            children: [
              _jsx(Skeleton, { className: "h-6 w-3/4" }),
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
    children: files.map((file) =>
      _jsxs(
        Card,
        {
          className: "p-4 flex flex-col gap-2",
          children: [
            _jsx("div", { className: "h-6 w-6 rounded-full bg-accent" }),
            _jsx("p", { className: "font-medium", children: file }),
          ],
        },
        file,
      ),
    ),
  });
}
