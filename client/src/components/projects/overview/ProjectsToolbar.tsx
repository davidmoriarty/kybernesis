// client/src/components/ProjectsToolbar.tsx

import { LayoutGrid, LayoutList, StretchHorizontal } from "lucide-react";
import { Container } from "@/components/app";
import type { ProjectView } from "@/components/projects/overview";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectsToolbarProps {
  view: ProjectView;
  onViewChange: (view: ProjectView) => void;
}

export function ProjectsToolbar({ view, onViewChange }: ProjectsToolbarProps) {
  return (
    <div className="sticky top-(--navbar-height) z-30 border-b border-gray-300 bg-background/90 supports-backdrop-filter:backdrop-blur dark:border-gray-500">
      <Container className="py-3 sm:py-5">
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <h1 className="text-center text-2xl font-black sm:text-left">
            Project List
          </h1>

          <ToggleGroup
            type="single"
            size="sm"
            value={view}
            onValueChange={(val) => val && onViewChange(val as ProjectView)}
            className="justify-self-end border"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="panel" aria-label="Panel view">
                  <StretchHorizontal />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Panel view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <LayoutGrid />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="list" aria-label="List view">
                  <LayoutList />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </ToggleGroup>
        </div>
      </Container>
    </div>
  );
}
