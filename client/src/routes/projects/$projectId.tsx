// client/src/routes/projects/$projectId.tsx
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  Columns2,
  Folder,
  FolderOpen,
  Home,
  Inbox,
  List,
  type LucideIcon,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/PageCard";
import {
  FilesSection,
  OverviewSection,
  SettingsSection,
  TasksSection,
  TimelineSection,
} from "@/components/projects/sections";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from "@/hooks/projects";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  component: ProjectPage,
});

type ProjectSection = "Overview" | "Files" | "Tasks" | "Timeline" | "Settings";

const SECTIONS: { label: ProjectSection; icon: LucideIcon }[] = [
  { label: "Overview", icon: Home },
  { label: "Files", icon: Inbox },
  { label: "Tasks", icon: List },
  { label: "Timeline", icon: Calendar },
  { label: "Settings", icon: Settings },
];

function ProjectPage() {
  const { projectId } = Route.useParams();
  const id = Number(projectId);

  const { data: project, isLoading, error } = useProject(id);
  const [section, setSection] = useState<ProjectSection>("Overview");

  if (isLoading) {
    return <LoadingState message="Loading project…" />;
  }

  if (error || !project) {
    return <ErrorState message="Project not found." />;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1 w-full h-full relative">
        <ProjectSidebar
          projectName={project.name}
          selected={section}
          onSelect={setSection}
        />

        <SidebarInset className="flex flex-col flex-1">
          {/* Top bar */}
          <div className="bg-accent flex items-center justify-between h-10 px-4 border-b">
            <SidebarTrigger />
            <h1 className="font-bold text-md">{section}</h1>
            <ToggleGroup type="multiple" variant="outline">
              <ToggleGroupItem value="files">
                <FolderOpen className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="columns">
                <Columns2 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-auto">
            {section === "Overview" && (
              <OverviewSection
                projectName={project.name}
                description={project.description || "No description provided"}
                owner={project?.owner}
                createdAt={project?.createdAt}
              />
            )}
            {section === "Files" && <FilesSection files={[]} />}
            {section === "Tasks" && <TasksSection tasks={[]} />}
            {section === "Timeline" && <TimelineSection events={[]} />}
            {section === "Settings" && <SettingsSection />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function ProjectSidebar({
  projectName,
  selected,
  onSelect,
}: {
  projectName: string;
  selected: ProjectSection;
  onSelect: (s: ProjectSection) => void;
}) {
  return (
    <Sidebar
      className={cn(
        "fixed top-16 sm:top-20 left-0 w-64",
        "h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)]",
      )}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="inline-flex items-center gap-2">
            <Folder className="size-4" />
            <span className="font-bold text-lg">{projectName}</span>
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {SECTIONS.map(({ label, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  isActive={selected === label}
                  onClick={() => onSelect(label)}
                >
                  <Icon className="size-4" />
                  {label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
