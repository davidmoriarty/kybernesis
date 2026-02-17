// client/src/components/ProjectsToolbar.tsx

import { LayoutGrid, LayoutList, StretchHorizontal } from "lucide-react";
import { Container } from "@/components/Container";
import { FormDialog } from "@/components/FormDialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ProjectView = "panel" | "grid" | "list";

interface ProjectsToolbarProps {
  view: ProjectView;
  onViewChange: (view: ProjectView) => void;
}

export function ProjectsToolbar({ view, onViewChange }: ProjectsToolbarProps) {
  return (
    <div className="sticky top-(--navbar-height) z-30 border-b bg-background/80 supports-backdrop-filter:backdrop-blur">
      <Container className="py-3">
        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <FormDialog
            cta="Create a new project"
            heading="Create a new project"
            subheading="Start a new project in your workspace"
          />

          <h1 className="text-center text-2xl font-black">Project List</h1>

          <ToggleGroup
            type="single"
            size="sm"
            value={view}
            onValueChange={(val) => val && onViewChange(val as ProjectView)}
            className="justify-self-end border"
          >
            <ToggleGroupItem value="panel">
              <StretchHorizontal />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid">
              <LayoutGrid />
            </ToggleGroupItem>
            <ToggleGroupItem value="list">
              <LayoutList />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Container>
    </div>
  );
}
