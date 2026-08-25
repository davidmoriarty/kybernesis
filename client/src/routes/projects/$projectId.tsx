// client/src/routes/projects/$projectId.tsx

import type { Project } from "@shared";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  Activity,
  FolderOpen,
  Home,
  ListTodo,
  type LucideIcon,
  Settings,
} from "lucide-react";
import { ProjectDetailPanel } from "@/components/projects/detail/ProjectDetailPanel";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { FileViewerPanel } from "@/components/projects/detail/sections/FileViewerPanel";
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { requireAuth } from "@/utils/requireAuth";
import { useProjectTasks } from "@/hooks/tasks";
import { useProjectEvents } from "@/hooks/projects";

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
  ): { section: ProjectSection; fileId?: string } => ({
    section:
      search.section === "Overview" ||
      search.section === "Files" ||
      search.section === "Tasks" ||
      search.section === "Timeline" ||
      search.section === "Settings"
        ? search.section
        : "Overview",
    fileId: typeof search.fileId === "string" ? search.fileId : undefined,
  }),
  component: ProjectPage,
});

const SECTIONS: { label: ProjectSection; icon: LucideIcon }[] = [
  { label: "Overview", icon: Home },
  { label: "Files", icon: FolderOpen },
  { label: "Tasks", icon: ListTodo },
  { label: "Timeline", icon: Activity },
  { label: "Settings", icon: Settings },
];

function ProjectPage() {
  const navigate = useNavigate();
  const { workspace } = Route.useRouteContext();
  const { projectId } = Route.useParams();
  const project = Route.useLoaderData();
  const { section, fileId } = Route.useSearch();
  const { data: timelineData, isLoading: timelineLoading } =
    useProjectEvents(projectId);
  const { data: tasksData, isLoading: tasksLoading } =
    useProjectTasks(projectId);

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
    <SidebarProvider sidebarTop="7.5rem">
      <div className="flex min-h-[calc(100dvh-var(--navbar-height))] w-full flex-col">
        {/* Project Detail subnav */}
        <div
          data-project-subnav
          className="sticky top-(--navbar-height) z-30 flex shrink-0 items-center justify-between border-b bg-background px-4 py-3 md:px-8"
        >
          <SidebarTrigger className="text-foreground" />

          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {section}
          </h1>

          <div className="min-w-8 md:min-w-30" />
        </div>

        {/* Project Detail layout */}
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <ProjectSidebar
            projectName={project.name}
            selected={section}
            sections={availableSections}
            onSelect={(nextSection) => {
              navigate({
                to: "/projects/$projectId",
                params: { projectId },
                search: { section: nextSection, fileId: undefined },
                replace: true,
              });
            }}
          />

          <SidebarInset className="min-h-0 min-w-0">
            {/* Content */}
            <ProjectDetailPanel>
              {section === "Overview" && (
                <OverviewSection
                  projectName={project.name}
                  description={
                    project.description ?? "No description provided."
                  }
                  createdAt={project?.createdAt}
                />
              )}
              {section === "Files" &&
                (fileId ? (
                  <FileViewerPanel projectId={projectId} fileId={fileId} />
                ) : (
                  <FilesSection projectId={projectId} />
                ))}
              {section === "Tasks" && (
                <TasksSection
                  projectId={projectId}
                  tasks={tasksLoading ? undefined : tasksData?.tasks}
                />
              )}
              {section === "Timeline" && (
                <TimelineSection
                  events={timelineLoading ? undefined : timelineData?.events}
                />
              )}
              {section === "Settings" && (
                <SettingsSection
                  projectId={project.id}
                  projectName={project.name}
                  status={project.status}
                  notificationsEnabled={project.notificationsEnabled}
                  isPublic={project.isPublic}
                />
              )}
            </ProjectDetailPanel>
          </SidebarInset>
        </div>
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
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="sticky top-0 z-10 bg-sidebar mb-4">
          <SidebarGroupLabel className="flex flex-col items-start px-2 py-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Project Name
            </span>
            <span className="font-bold text-base text-foreground">
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
                  onClick={() => {
                    onSelect(label);

                    if (isMobile) {
                      setOpenMobile(false);
                    }
                  }}
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
