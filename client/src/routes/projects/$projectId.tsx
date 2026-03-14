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
import { rpc } from "@/lib/rpc";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { requireAuth } from "@/utils/requireAuth";
import { useProjectTasks } from "@/hooks/tasks";

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
  const { section } = Route.useSearch();
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
    <SidebarProvider>
      <div className="flex h-full min-h-0 w-full relative overflow-hidden">
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

        <SidebarInset>
          {/* Top bar */}
          <div className="flex items-center justify-between py-3 px-8">
            <SidebarTrigger className="text-foreground" />
            <h1 className="font-bold text-2xl tracking-tight text-foreground">
              {section}
            </h1>
            <div className="min-w-30 flex justify-end" />
          </div>

          {/* Content */}
          <div className="min-h-0 bg-secondary text-foreground p-4 flex-1 overflow-auto">
            {section === "Overview" && (
              <OverviewSection
                projectName={project.name}
                description={project.description ?? "No description provided."}
                createdAt={project?.createdAt}
              />
            )}
            {section === "Files" && <FilesSection files={[]} />}
            {section === "Tasks" && (
              <TasksSection
                projectId={projectId}
                tasks={tasksLoading ? undefined : tasksData?.tasks}
              />
            )}
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
