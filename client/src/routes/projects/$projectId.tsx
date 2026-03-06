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
import { cn } from "@/lib/utils";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  loader: async ({ params }) => {
    const res = await rpc.$get(`/projects/${params.projectId}`, {
      credentials: "include",
    });

    return parseOrThrow<{
      id: string;
      name: string;
      description?: string;
      workspaceId: string;
      owner: string;
      createdAt: string;
      updatedAt: string;
    }>(res);
  },
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
  const project = Route.useLoaderData();
  const [section, setSection] = useState<ProjectSection>("Overview");

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
          <div className="bg-gray-200 dark:bg-gray-500 flex items-center justify-between text-foreground h-10 px-4 border-b">
            <SidebarTrigger className="text-background" />
            <h1 className="font-bold text-lg text-background">{section}</h1>
            <ToggleGroup type="multiple">
              <ToggleGroupItem
                value="files"
                className="border border-background"
              >
                <FolderOpen className="h-4 w-4 text-background" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                className="border border-background"
              >
                <List className="h-4 w-4 text-background" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="columns"
                className="border border-background"
              >
                <Columns2 className="h-4 w-4 text-background" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Content */}
          <div className="min-h-screen bg-gray-200 dark:bg-gray-500 p-4 flex-1 overflow-auto">
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
        "fixed top-15 sm:top-15 left-0 w-64 bg-gray-600 dark:bg-gray-700",
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
