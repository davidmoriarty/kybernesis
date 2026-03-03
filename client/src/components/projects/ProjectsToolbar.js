import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// client/src/components/ProjectsToolbar.tsx
import { LayoutGrid, LayoutList, StretchHorizontal } from "lucide-react";
import { Container } from "@/components/Container";
import { FormDialog } from "@/components/FormDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
export function ProjectsToolbar({ view, onViewChange }) {
  return _jsx("div", {
    className:
      "sticky top-(--navbar-height) z-30 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 supports-backdrop-filter:backdrop-blur",
    children: _jsx(Container, {
      className: "py-5",
      children: _jsxs("div", {
        className: "grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center",
        children: [
          _jsx(FormDialog, {
            cta: "Create a new project",
            heading: "Create a new project",
            subheading: "Start a new project in your workspace",
          }),
          _jsx("h1", {
            className: "text-center text-2xl font-black",
            children: "Project List",
          }),
          _jsxs(ToggleGroup, {
            type: "single",
            size: "sm",
            value: view,
            onValueChange: (val) => val && onViewChange(val),
            className: "justify-self-end border",
            children: [
              _jsx(ToggleGroupItem, {
                value: "panel",
                children: _jsx(StretchHorizontal, {}),
              }),
              _jsx(ToggleGroupItem, {
                value: "grid",
                children: _jsx(LayoutGrid, {}),
              }),
              _jsx(ToggleGroupItem, {
                value: "list",
                children: _jsx(LayoutList, {}),
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
