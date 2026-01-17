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
  Search,
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
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useProject } from "@/hooks/projects";
import { cn } from "@/lib/utils";
import { requireAuth } from "@/utils/requireAuth";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  component: ProjectPage,
});

// Sidebar items with icons
const SECTIONS = [
  { label: "Overview", icon: Home },
  { label: "Files", icon: Inbox },
  { label: "Tasks", icon: Calendar },
  { label: "Timeline", icon: Search },
  { label: "Settings", icon: Settings },
];

// Mock data for sections
const MOCK_FILES = ["File A.txt", "File B.docx", "File C.pdf"];
const MOCK_TASKS: {
  title: string;
  status?: "Todo" | "In Progress" | "Done";
}[] = [
  { title: "Design login page", status: "In Progress" },
  { title: "Set up database schema", status: "Todo" },
  { title: "Write unit tests", status: "Done" },
];
const MOCK_TIMELINE = [
  { event: "Kickoff Meeting", date: "2026-01-15" },
  { event: "First Release", date: "2026-02-01" },
];
const MOCK_SETTINGS = {
  notificationsEnabled: true,
  isPublic: false,
};

function ProjectPage() {
  const { projectId } = Route.useParams();
  const id = Number(projectId);
  const { data: project, isLoading, error } = useProject(id);

  const [selectedSection, setSelectedSection] = useState("Overview");

  if (isLoading) {
    return <Skeleton className="h-[60vh] w-full rounded-md" />;
  }
  if (error || !project) return <p>Project not found.</p>;

  return (
    <SidebarProvider>
      <div className="flex flex-1 w-full h-full relative">
        {/* Sidebar */}
        <Sidebar
          className={cn(
            "fixed top-16 sm:top-20 left-0 w-64",
            "h-[calc(100vh - 4rem)] sm:h-[calc(100vh-5rem)]",
          )}
        >
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="inline-flex justify-start gap-4">
                <Folder className="size-4" />
                <p className="font-bold text-lg">{project.name}</p>
              </SidebarGroupLabel>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarMenu>
                {SECTIONS.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={selectedSection === item.label}
                      onClick={() => setSelectedSection(item.label)}
                      asChild
                    >
                      <div className="inline-flex items-center gap-2">
                        <item.icon className="size-4" />
                        {item.label}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <SidebarInset className="flex flex-col flex-1">
          {/* Top bar */}
          <div className="bg-accent flex items-center justify-between h-10 px-4 border-b-2">
            <SidebarTrigger />
            <h1 className="font-bold text-md">{selectedSection}</h1>
            <ToggleGroup type="multiple" variant="outline">
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <FolderOpen className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="strikethrough"
                aria-label="Toggle strikethrough"
              >
                <Columns2 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 overflow-auto">
            {selectedSection === "Overview" && (
              <OverviewSection
                projectName={project.name}
                description={project.description || "No description provided"}
              />
            )}
            {selectedSection === "Files" && <FilesSection files={MOCK_FILES} />}
            {selectedSection === "Tasks" && <TasksSection tasks={MOCK_TASKS} />}
            {selectedSection === "Timeline" && (
              <TimelineSection events={MOCK_TIMELINE} />
            )}
            {selectedSection === "Settings" && (
              <SettingsSection {...MOCK_SETTINGS} />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
