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
  DeleteProjectDangerDialog,
  RemoveProjectMemberDialog,
} from "@/components/projects/detail/dialogs";
import { useUpdateProject, useDeleteProject } from "@/hooks/projects";
import {
  useAddProjectMember,
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
  const addProjectMember = useAddProjectMember(projectId);
  const removeProjectMember = useRemoveProjectMember(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const { data, isLoading } = useProjectMembers(projectId);
  const adminCount =
    data?.members?.filter((m) => m.role === "admin").length ?? 0;

  const [email, setEmail] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [projectNameValue, setProjectNameValue] = useState(projectName);
  const [notificationsValue, setNotificationsValue] = useState(
    notificationsEnabled ?? false,
  );
  const [publicValue, setPublicValue] = useState(isPublic ?? false);
  const [statusValue, setStatusValue] = useState<"development" | "live">(
    status,
  );

  const settings = [
    {
      label: "Project Status",
      leftLabel: "Development",
      rightLabel: "Live",
      leftTone: "info" as const,
      rightTone: "success" as const,
      checked: statusValue === "live",
      onCheckedChange: async (checked: boolean) => {
        const prev = statusValue;
        const next = checked ? "live" : "development";

        setStatusValue(next);

        try {
          await updateProject.mutateAsync({
            projectId,
            status: next,
          });

          appToast.projects.statusUpdateSuccess(next);
        } catch {
          setStatusValue(prev);
        }
      },
    },
    {
      label: "Notifications",
      leftLabel: "Off",
      rightLabel: "On",
      leftTone: "danger" as const,
      rightTone: "success" as const,
      checked: notificationsValue,
      onCheckedChange: async (checked: boolean) => {
        const prev = notificationsValue;
        setNotificationsValue(checked);

        try {
          await updateProject.mutateAsync({
            projectId,
            notificationsEnabled: checked,
          });

          appToast.projects.notificationUpdateSuccess(checked);
        } catch {
          setNotificationsValue(prev);
        }
      },
    },
    {
      label: "Project Visibility",
      leftLabel: "Private",
      rightLabel: "Public",
      leftTone: "info" as const,
      rightTone: "success" as const,
      checked: publicValue,
      onCheckedChange: async (checked: boolean) => {
        const prev = publicValue;
        setPublicValue(checked);

        try {
          await updateProject.mutateAsync({
            projectId,
            isPublic: checked,
          });

          appToast.projects.visibilityUpdateSuccess(checked);
        } catch {
          setPublicValue(prev);
        }
      },
    },
  ];

  useEffect(() => {
    setProjectNameValue(projectName);
  }, [projectName]);

  useEffect(() => {
    setStatusValue(status);
  }, [status]);

  return (
    <div className="flex flex-col gap-4">
      {/* Project Name */}
      <Card className="flex flex-col gap-4 p-4">
        <CardHeader>
          <CardTitle>Project Name</CardTitle>
          <CardDescription>Change the project name.</CardDescription>
        </CardHeader>

        <CardContent>
          {!isRenaming ? (
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-base font-semibold">{projectNameValue}</h4>
              <Button
                variant="solid"
                color="primary"
                size="md"
                className="px-6"
                onClick={() => setIsRenaming(true)}
              >
                Rename
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={projectNameValue}
                onChange={(e) => setProjectNameValue(e.target.value)}
              />

              <Button
                variant="solid"
                color="primary"
                size="md"
                className="px-6"
                disabled={updateProject.isPending || !projectNameValue.trim()}
                onClick={async () => {
                  try {
                    await updateProject.mutateAsync({
                      projectId,
                      name: projectNameValue.trim(),
                    });
                    setIsRenaming(false);
                    appToast.projects.nameUpdateSuccess();
                  } catch {
                    // useUpdateProject handles error toast
                  }
                }}
              >
                Save
              </Button>

              <Button
                variant="outline"
                color="secondary"
                size="md"
                className="px-6"
                onClick={() => {
                  setProjectNameValue(projectName);
                  setIsRenaming(false);
                }}
              >
                Cancel
              </Button>
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
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <Input
              placeholder="Add member by email…"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              variant="solid"
              color="primary"
              size="md"
              className="px-6"
              disabled={addProjectMember.isPending || !email.trim()}
              onClick={async () => {
                try {
                  await addProjectMember.mutateAsync({ email: email.trim() });
                  setEmail("");
                } catch {
                  // Toast is handled by useAddProjectMember.
                }
              }}
            >
              Add
            </Button>
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
                    className="flex items-center justify-between border rounded py-2 px-4"
                  >
                    <div className="grid gap-2">
                      <div className="grid grid-cols-2 gap-3">
                        <p className="font-bold">{m.name}</p>
                        <Badge>{m.role}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {m.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40 p-4 flex flex-col gap-4">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-destructive">
            Danger Zone
          </CardTitle>
          <CardDescription>Manage destructive project actions.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 p-4">
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
