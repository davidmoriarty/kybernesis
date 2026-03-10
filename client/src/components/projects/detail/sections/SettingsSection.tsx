// client/src/components/projects/detail/sections/SettingsSection.tsx
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
      label: `Notifications: ${notificationsValue ? "Enabled" : "Disabled"}`,
      value: notificationsValue,
      field: "notificationsEnabled" as const,
    },
    {
      label: `Project Visibility: ${publicValue ? "Public" : "Private"}`,
      value: publicValue,
      field: "isPublic" as const,
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
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Project Name</CardTitle>
        </CardHeader>
        <CardContent>
          {!isRenaming ? (
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-base font-semibold">{projectNameValue}</h4>
              <Button
                variant="default"
                size="default"
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
                variant="default"
                size="default"
                className="px-6"
                disabled={updateProject.isPending || !projectNameValue.trim()}
                onClick={async () => {
                  try {
                    await updateProject.mutateAsync({
                      projectId,
                      name: projectNameValue.trim(),
                    });
                    setIsRenaming(false);
                    toast.success("Project name updated");
                  } catch {
                    toast.error("Failed to update project name");
                  }
                }}
              >
                Save
              </Button>

              <Button
                variant="outline"
                size="default"
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

      {/* Project Status */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Set the current development status of this project.
          </p>

          <div className="flex gap-2">
            <Button
              variant={statusValue === "development" ? "default" : "outline"}
              disabled={updateProject.isPending}
              onClick={async () => {
                const prev = statusValue;
                setStatusValue("development");

                try {
                  await updateProject.mutateAsync({
                    projectId,
                    status: "development",
                  });
                  toast.success("Project status set to In Development");
                } catch {
                  setStatusValue(prev);
                  toast.error("Failed to update project status");
                }
              }}
            >
              In Development
            </Button>

            <Button
              variant={statusValue === "live" ? "default" : "outline"}
              disabled={updateProject.isPending}
              onClick={async () => {
                const prev = statusValue;
                setStatusValue("live");

                try {
                  await updateProject.mutateAsync({
                    projectId,
                    status: "live",
                  });
                  toast.success("Project status set to Live");
                } catch {
                  setStatusValue(prev);
                  toast.error("Failed to update project status");
                }
              }}
            >
              Live
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications && Visibility */}
      {notificationsEnabled === undefined && isPublic === undefined
        ? [1, 2].map((i) => (
            <Card key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-10" />
            </Card>
          ))
        : settings.map((item) => (
            <Card
              key={item.label}
              className="p-4 flex items-center justify-between"
            >
              <p className="font-medium">{item.label}</p>
              <Switch
                variant="success"
                checked={item.value}
                disabled={updateProject.isPending}
                onCheckedChange={async (checked) => {
                  const prev =
                    item.field === "notificationsEnabled"
                      ? notificationsValue
                      : publicValue;

                  if (item.field === "notificationsEnabled") {
                    setNotificationsValue(checked);
                  } else {
                    setPublicValue(checked);
                  }

                  try {
                    await updateProject.mutateAsync({
                      projectId,
                      [item.field]: checked,
                    });

                    if (item.field === "notificationsEnabled") {
                      toast.success(
                        checked
                          ? "Project notifications enabled"
                          : "Project notifications disabled",
                      );
                    }

                    if (item.field === "isPublic") {
                      toast.success(
                        checked
                          ? "Project is now public"
                          : "Project is now private",
                      );
                    }
                  } catch {
                    if (item.field === "notificationsEnabled") {
                      setNotificationsValue(prev);
                    } else {
                      setPublicValue(prev);
                    }

                    toast.error("Failed to update project settings");
                  }
                }}
              />
            </Card>
          ))}

      {/* Project Members */}
      <Card className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Project Members</h3>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-4">
          <Input
            placeholder="Add member by email…"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            variant="default"
            size="default"
            className="px-6"
            disabled={addProjectMember.isPending || !email.trim()}
            onClick={async () => {
              try {
                await addProjectMember.mutateAsync({ email: email.trim() });
                setEmail("");
                toast.success("Member added to project");
              } catch {
                toast.error("Failed to add member to project");
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
                      <p className="text-sm text-muted-foreground">{m.email}</p>
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
                          toast.success("Member removed from project");
                        } catch {
                          toast.error("Failed to remove member from project");
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
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
        </div>

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
                toast.success("Project deleted");
                navigate({ to: "/projects", replace: true });
              } catch {
                toast.error("Failed to delete project");
                throw new Error("Delete project failed");
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
}
