// client/src/routes/projects/$projectId.tsx
import type { Project } from "@shared";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
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
import {
  FilesSection,
  OverviewSection,
  SettingsSection,
  TasksSection,
  TimelineSection,
} from "@/components/projects/detail/sections";
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

type ProjectSection = "Overview" | "Files" | "Tasks" | "Timeline" | "Settings";

export const Route = createFileRoute("/projects/$projectId")({
  beforeLoad: requireAuth,
  loader: async ({ params }) => {
    const res = await rpc.$get(`/projects/${params.projectId}`, {
      credentials: "include",
    });

    return parseOrThrow<
      Project & {
        owner: string;
      }
    >(res);
  },
  validateSearch: (
    search: Record<string, unknown>,
  ): { section: ProjectSection } => ({
    section:
      search.section === "Overview" ||
      search.section === "Files" ||
      search.section === "Tasks" ||
      search.section === "Timeline" ||
      search.section === "Settings"
        ? search.section
        : "Overview",
  }),
  component: ProjectPage,
});

const SECTIONS: { label: ProjectSection; icon: LucideIcon }[] = [
  { label: "Overview", icon: Home },
  { label: "Files", icon: Inbox },
  { label: "Tasks", icon: List },
  { label: "Timeline", icon: Calendar },
  { label: "Settings", icon: Settings },
];

function ProjectPage() {
  const navigate = useNavigate();
  const { workspace } = Route.useRouteContext();
  const { projectId } = Route.useParams();
  const project = Route.useLoaderData();
  const { section } = Route.useSearch();

  const isWorkspaceAdmin = workspace?.role === "admin";

  const availableSections = isWorkspaceAdmin
    ? SECTIONS
    : SECTIONS.filter((s) => s.label !== "Settings");

  useEffect(() => {
    if (!isWorkspaceAdmin && section === "Settings") {
      navigate({
        to: "/projects/$projectId",
        params: { projectId },
        search: { section: "Overview" },
        replace: true,
      });
    }
  }, [isWorkspaceAdmin, navigate, projectId, section]);

  if (!isWorkspaceAdmin && section === "Settings") {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-1 w-full h-full relative">
        <ProjectSidebar
          projectName={project.name}
          selected={section}
          sections={availableSections}
          onSelect={(nextSection) => {
            navigate({
              to: "/projects/$projectId",
              params: { projectId },
              search: { section: nextSection },
              replace: true,
            });
          }}
        />

        <SidebarInset className="flex flex-col flex-1">
          {/* Top bar */}
          <div className="bg-secondary text-foreground flex items-center justify-between py-2 px-4">
            <SidebarTrigger className="text-foreground" />
            <h1 className="font-bold text-lg text-foreground">{section}</h1>
            <ToggleGroup type="multiple">
              <ToggleGroupItem value="files" className="border border-border">
                <FolderOpen className="h-4 w-4 text-foreground" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="border border-border">
                <List className="h-4 w-4 text-foreground" />
              </ToggleGroupItem>
              <ToggleGroupItem value="columns" className="border border-border">
                <Columns2 className="h-4 w-4 text-foreground" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Content */}
          <div className="min-h-screen bg-secondary text-foreground p-4 flex-1 overflow-auto">
            {section === "Overview" && (
              <OverviewSection
                projectName={project.name}
                description={project.description ?? "No description provided"}
                owner={project?.owner}
                createdAt={project?.createdAt}
              />
            )}
            {section === "Files" && <FilesSection files={[]} />}
            {section === "Tasks" && <TasksSection tasks={[]} />}
            {section === "Timeline" && <TimelineSection events={[]} />}
            {section === "Settings" && (
              <SettingsSection
                projectId={project.id}
                projectName={project.name}
                status={project.status}
                notificationsEnabled={project.notificationsEnabled}
                isPublic={project.isPublic}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function ProjectSidebar({
  projectName,
  selected,
  sections,
  onSelect,
}: {
  projectName: string;
  selected: ProjectSection;
  sections: { label: ProjectSection; icon: LucideIcon }[];
  onSelect: (s: ProjectSection) => void;
}) {
  return (
    <Sidebar
      className={cn(
        "fixed top-15 sm:top-15 left-0 w-64",
        "h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)]",
      )}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="inline-flex items-center gap-2">
            <Folder className="size-4 text-foreground" />
            <span className="font-bold text-lg text-foreground">
              {projectName}
            </span>
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            {sections.map(({ label, icon: Icon }) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton
                  isActive={selected === label}
                  onClick={() => onSelect(label)}
                  className="text-foreground"
                >
                  <Icon className="size-4 text-foreground" />
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
