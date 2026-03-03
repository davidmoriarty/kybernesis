import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export default function TimelineSection({ events }) {
  if (!events) {
    // show placeholders
    return _jsx("div", {
      className: "flex flex-col gap-4",
      children: [1, 2, 3].map((i) =>
        _jsxs(
          Card,
          {
            className: "p-4 flex items-center gap-4",
            children: [
              _jsx(Skeleton, { className: "h-6 w-6 rounded-full" }),
              _jsxs("div", {
                className: "flex flex-col gap-1",
                children: [
                  _jsx(Skeleton, { className: "h-4 w-32" }),
                  _jsx(Skeleton, { className: "h-3 w-48" }),
                ],
              }),
            ],
          },
          i,
        ),
      ),
    });
  }
  return _jsx("div", {
    className: "flex flex-col gap-4",
    children: events.map((e) =>
      _jsxs(
        Card,
        {
          className: "p-4 flex items-center gap-4",
          children: [
            _jsx("div", { className: "h-6 w-6 rounded-full bg-accent" }),
            _jsxs("div", {
              className: "flex flex-col gap-1",
              children: [
                _jsx("p", { className: "font-medium", children: e.event }),
                _jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children: e.date,
                }),
              ],
            }),
          ],
        },
        `${e.event}-${e.date}`,
      ),
    ),
  });
}
