// client/src/lib/toast.ts
import { toast } from "sonner";

export const appToast = {
  auth: {
    profileUpdateSuccess: () => toast.success("Profile updated!"),
    profileUpdateError: () => toast.error("Failed to update profile"),

    signupSuccess: () => toast.success("Account created successfully"),
    signupError: () => toast.error("Sign up failed"),

    loginSuccess: () => toast.success("Welcome back"),
    loginError: () => toast.error("Login failed"),

    logoutSuccess: () => toast.success("Signed out"),
    logoutError: () => toast.error("Failed to sign out"),
  },

  projects: {
    noActiveWorkspace: () => toast.error("No active workspace selected."),

    createSuccess: () => toast.success("Project created"),
    createError: () => toast.error("Failed to create project"),

    updateSuccess: () => toast.success("Project updated"),
    updateError: () => toast.error("Failed to update project"),

    nameUpdateSuccess: () => toast.success("Project name updated"),

    statusUpdateSuccess: (status: "development" | "live") =>
      toast.success(
        status === "live"
          ? "Project status set to Live"
          : "Project status set to In Development",
      ),

    notificationUpdateSuccess: (enabled: boolean) =>
      toast.success(
        enabled
          ? "Project notifications enabled"
          : "Project notifications disabled",
      ),

    visibilityUpdateSuccess: (isPublic: boolean) =>
      toast.success(
        isPublic ? "Project is now public" : "Project is now private",
      ),

    deleteSuccess: () => toast.success("Project deleted"),
    deleteError: () => toast.error("Failed to delete project"),
  },

  projectMembers: {
    addSuccess: () => toast.success("Member added to project"),
    addError: () => toast.error("Failed to add member to project"),

    removeSuccess: () => toast.success("Member removed from project"),
    removeError: () => toast.error("Failed to remove member from project"),
  },

  files: {
    uploadSuccess: () => toast.success("File uploaded"),
    uploadError: () => toast.error("Failed to upload file"),

    deleteSuccess: () => toast.success("File deleted"),
    deleteError: () => toast.error("Failed to delete file"),

    saveSuccess: () => toast.success("File saved"),
    saveError: () => toast.error("Failed to save file"),

    renameSuccess: () => toast.success("File renamed"),
    renameError: () => toast.error("Failed to rename file"),
  },

  tasks: {
    createSuccess: () => toast.success("Task created"),
    createError: () => toast.error("Failed to create task"),

    statusUpdateSuccess: () => toast.success("Task status updated"),
    statusUpdateError: () => toast.error("Failed to update task status"),
  },

  workspaces: {
    selectSuccess: () => toast.success("Workspace selected"),
    selectError: () => toast.error("Failed to select workspace"),
  },
};
