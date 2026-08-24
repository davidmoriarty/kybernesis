// client/src/components/projects/detail/sections/SettingsSection.tsx

import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { appToast } from "@/lib/toast";
import { ProjectSettingRow } from "@/components/projects/detail/sections/settings/ProjectSettingRow";
import {
  AddProjectMemberDialog,
  DeleteProjectDangerDialog,
  RemoveProjectMemberDialog,
} from "@/components/projects/detail/dialogs";
import { useUpdateProject, useDeleteProject } from "@/hooks/projects";
import {
  useProjectMembers,
  useRemoveProjectMember,
} from "@/hooks/projectMembers";

interface SettingsSectionProps {
  projectId: string;
  projectName: string;
  notificationsEnabled?: boolean;
  isPublic?: boolean;
  status?: "development" | "live";
}

export function SettingsSection({
  projectId,
  projectName,
  notificationsEnabled,
  isPublic,
  status = "development",
}: SettingsSectionProps) {
  const navigate = useNavigate();
  const removeProjectMember = useRemoveProjectMember(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const { data, isLoading } = useProjectMembers(projectId);
  const adminCount =
    data?.members?.filter((m) => m.role === "admin").length ?? 0;
  const [isRenaming, setIsRenaming] = useState(false);
  const [projectNameValue, setProjectNameValue] = useState(projectName);
  const [notificationsValue, setNotificationsValue] = useState(
    notificationsEnabled ?? false,
  );
  const [publicValue, setPublicValue] = useState(isPublic ?? false);
  const [statusValue, setStatusValue] = useState<"development" | "live">(
    status,
  );

  async function handleStatusChange(checked: boolean) {
    const previous = statusValue;
    const next = checked ? "live" : "development";

    setStatusValue(next);

    try {
      await updateProject.mutateAsync({
        projectId,
        status: next,
      });

      appToast.projects.statusUpdateSuccess(next);
    } catch {
      setStatusValue(previous);
    }
  }

  async function handleNotificationsChange(checked: boolean) {
    const previous = notificationsValue;

    setNotificationsValue(checked);

    try {
      await updateProject.mutateAsync({
        projectId,
        notificationsEnabled: checked,
      });

      appToast.projects.notificationUpdateSuccess(checked);
    } catch {
      setNotificationsValue(previous);
    }
  }

  async function handleVisibilityChange(checked: boolean) {
    const previous = publicValue;

    setPublicValue(checked);

    try {
      await updateProject.mutateAsync({
        projectId,
        isPublic: checked,
      });

      appToast.projects.visibilityUpdateSuccess(checked);
    } catch {
      setPublicValue(previous);
    }
  }

  async function handleRenameProject() {
    const name = projectNameValue.trim();
    if (!name) return;

    try {
      await updateProject.mutateAsync({
        projectId,
        name,
      });

      setIsRenaming(false);
      appToast.projects.nameUpdateSuccess();
    } catch {
      // useUpdateProject handles error toast
    }
  }

  function handleCancelRename() {
    setProjectNameValue(projectName);
    setIsRenaming(false);
  }

  const settings = [
    {
      label: "Project Status",
      leftLabel: "Development",
      rightLabel: "Live",
      leftTone: "info" as const,
      rightTone: "success" as const,
      checked: statusValue === "live",
      onCheckedChange: handleStatusChange,
    },
    {
      label: "Notifications",
      leftLabel: "Off",
      rightLabel: "On",
      leftTone: "danger" as const,
      rightTone: "success" as const,
      checked: notificationsValue,
      onCheckedChange: handleNotificationsChange,
    },
    {
      label: "Project Visibility",
      leftLabel: "Private",
      rightLabel: "Public",
      leftTone: "info" as const,
      rightTone: "success" as const,
      checked: publicValue,
      onCheckedChange: handleVisibilityChange,
    },
  ];

  useEffect(() => {
    setProjectNameValue(projectName);
  }, [projectName]);

  useEffect(() => {
    setStatusValue(status);
  }, [status]);

  useEffect(() => {
    setNotificationsValue(notificationsEnabled ?? false);
  }, [notificationsEnabled]);

  useEffect(() => {
    setPublicValue(isPublic ?? false);
  }, [isPublic]);

  return (
    <div className="flex flex-col gap-4">
      {/* Project Name */}
      <Card>
        <CardHeader>
          <CardTitle>Project Name</CardTitle>
          <CardDescription>Change the project name.</CardDescription>
        </CardHeader>

        <CardContent>
          {!isRenaming ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid gap-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current Name
                </p>
                <p className="text-base font-semibold">{projectNameValue}</p>
              </div>

              <Button
                variant="solid"
                color="primary"
                size="md"
                className="w-full sm:w-auto sm:justify-self-end"
                onClick={() => setIsRenaming(true)}
              >
                Rename Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  New Name
                </p>
                <Input
                  autoFocus
                  value={projectNameValue}
                  onChange={(e) => setProjectNameValue(e.target.value)}
                />
              </div>

              <div className="grid gap-2 sm:flex sm:justify-end">
                <Button
                  variant="solid"
                  color="primary"
                  size="md"
                  className="w-full sm:w-auto"
                  disabled={updateProject.isPending || !projectNameValue.trim()}
                  onClick={handleRenameProject}
                >
                  Save
                </Button>

                <Button
                  variant="outline"
                  color="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                  onClick={handleCancelRename}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Project Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>Configure your project settings.</CardDescription>
        </CardHeader>

        <CardContent className="divide-y">
          {settings.map((setting) => (
            <ProjectSettingRow
              key={setting.label}
              label={setting.label}
              leftLabel={setting.leftLabel}
              rightLabel={setting.rightLabel}
              leftTone={setting.leftTone}
              rightTone={setting.rightTone}
              checked={setting.checked}
              disabled={updateProject.isPending}
              onCheckedChange={setting.onCheckedChange}
            />
          ))}
        </CardContent>
      </Card>

      {/* Project Members */}
      <Card>
        <CardHeader>
          <CardTitle>Project Members</CardTitle>
          <CardDescription>Manage user access to the project.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <AddProjectMemberDialog projectId={projectId} />
          </div>

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <Skeleton className="h-6 w-40" />
            ) : (
              data?.members.map((m) => {
                const isLastAdmin = m.role === "admin" && adminCount === 1;

                return (
                  <div
                    key={m.userId}
                    className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{m.name}</p>
                        <Badge>{m.role}</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">{m.email}</p>
                    </div>

                    <RemoveProjectMemberDialog
                      memberName={m.name}
                      disabled={removeProjectMember.isPending || isLastAdmin}
                      onConfirm={async () => {
                        try {
                          await removeProjectMember.mutateAsync({
                            userId: m.userId,
                          });
                        } catch {
                          throw new Error("Remove member failed");
                        }
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Manage destructive project actions.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <p className="font-semibold">Delete Project</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all associated access.
              </p>
            </div>

            <DeleteProjectDangerDialog
              projectName={projectName}
              disabled={deleteProject.isPending}
              onConfirm={async () => {
                try {
                  await deleteProject.mutateAsync({ projectId });
                  navigate({ to: "/projects", replace: true });
                } catch {
                  throw new Error("Delete project failed");
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
