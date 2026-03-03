import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export function WorkspaceDashboard({ summary }) {
  return _jsxs("section", {
    className: "space-y-6",
    children: [
      _jsxs("div", {
        className: "space-y-1 pl-2",
        children: [
          _jsx("h2", {
            className: "font-semibold text-xl",
            children: summary.workspace.name,
          }),
          _jsxs(Badge, {
            variant:
              summary.workspace.role === "admin" ? "default" : "secondary",
            className: "capitalize",
            children: [
              _jsx("strong", { children: "Role: " }),
              summary.workspace.role,
            ],
          }),
          _jsxs("p", {
            className: "text-sm text-gray-600",
            children: [
              _jsx("strong", { children: "Workspace ID:" }),
              " ",
              summary.workspace.id,
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "grid gap-4 md:grid-cols-3",
        children: [
          _jsxs(Card, {
            children: [
              _jsxs(CardHeader, {
                children: [
                  _jsx(CardTitle, { children: "Members" }),
                  _jsx(CardDescription, {
                    children: "Online if active within the last 5 minutes",
                  }),
                ],
              }),
              _jsx(CardContent, {
                className: "space-y-2",
                children:
                  summary.members.length === 0
                    ? _jsx("p", {
                        className: "text-sm text-muted-foreground",
                        children: "No members found.",
                      })
                    : summary.members.map((m) =>
                        _jsxs(
                          "div",
                          {
                            className: "flex items-center justify-between",
                            children: [
                              _jsx("span", {
                                className: "font-medium",
                                children: m.name,
                              }),
                              _jsxs("span", {
                                className:
                                  "inline-flex items-center gap-2 text-sm text-muted-foreground",
                                children: [
                                  _jsx("span", {
                                    className: [
                                      "inline-block h-2.5 w-2.5 rounded-full",
                                      m.status === "online"
                                        ? "bg-emerald-500"
                                        : "bg-red-500",
                                    ].join(" "),
                                    "aria-hidden": "true",
                                  }),
                                  _jsx("span", {
                                    className: "capitalize",
                                    children: m.status,
                                  }),
                                  m.status === "offline" && m.lastSeenAt
                                    ? _jsxs("span", {
                                        className:
                                          "text-xs text-muted-foreground",
                                        children: [
                                          "\u00B7 last seen ",
                                          formatLastSeen(m.lastSeenAt),
                                        ],
                                      })
                                    : null,
                                ],
                              }),
                            ],
                          },
                          m.id,
                        ),
                      ),
              }),
            ],
          }),
          _jsxs(Card, {
            children: [
              _jsxs(CardHeader, {
                children: [
                  _jsx(CardTitle, { children: "Active Projects" }),
                  _jsx(CardDescription, {
                    children: "All projects (status TBD)",
                  }),
                ],
              }),
              _jsxs(CardContent, {
                children: [
                  _jsx("div", {
                    className: "text-3xl font-black",
                    children: summary.counts.activeProjects,
                  }),
                  summary.recentProjects.length > 0 &&
                    _jsx("div", {
                      className: "mt-3 space-y-1 text-sm text-muted-foreground",
                      children: summary.recentProjects.map((p) =>
                        _jsx(
                          "div",
                          { className: "truncate", children: p.name },
                          p.id,
                        ),
                      ),
                    }),
                ],
              }),
            ],
          }),
          _jsxs(Card, {
            children: [
              _jsxs(CardHeader, {
                children: [
                  _jsx(CardTitle, { children: "Completed Projects" }),
                  _jsx(CardDescription, {
                    children: "Requires project status",
                  }),
                ],
              }),
              _jsx(CardContent, {
                children: _jsx("div", {
                  className: "text-3xl font-black",
                  children: summary.counts.completedProjects,
                }),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function formatLastSeen(iso) {
  const last = new Date(iso).getTime();
  const diffMs = Date.now() - last;
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}
