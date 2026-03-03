import {
  jsx as _jsx,
  jsxs as _jsxs,
  Fragment as _Fragment,
} from "react/jsx-runtime";
// client/src/components/ProjectList.tsx
import { ErrorState, LoadingState } from "@/components/PageCard";
import { ProjectCard } from "@/components/ProjectCard";
import { cn } from "@/lib/utils";
export function ProjectList({ projects, view, isLoading, error }) {
  if (isLoading) {
    return _jsx(LoadingState, { message: "Loading projects..." });
  }
  if (error) {
    return _jsx(ErrorState, { message: "Failed to load projects." });
  }
  if (!projects?.length) {
    return _jsx("div", {
      className: "border rounded-md p-6 text-center",
      children: "No projects yet",
    });
  }
  const listClass = cn(
    view === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      : view === "list"
        ? ""
        : "space-y-4",
  );
  return _jsxs(_Fragment, {
    children: [
      view === "list" &&
        _jsxs("div", {
          className:
            "grid grid-cols-[2fr_3fr_auto] gap-4 px-4 py-3 text-sm font-semibold border-b",
          children: [
            _jsx("div", { children: "Name" }),
            _jsx("div", { children: "Description" }),
            _jsx("div", { children: "Actions" }),
          ],
        }),
      _jsx("div", {
        className: listClass,
        children: projects.map((p) =>
          _jsx(
            ProjectCard,
            { id: p.id, name: p.name, description: p.description, view: view },
            p.id,
          ),
        ),
      }),
    ],
  });
}
