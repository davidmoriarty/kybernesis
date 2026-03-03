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
    createSuccess: () => toast.success("Project created"),
    createError: () => toast.error("Failed to create project"),
    updateSuccess: () => toast.success("Project updated"),
    updateError: () => toast.error("Failed to update project"),
    deleteSuccess: () => toast.success("Project deleted"),
    deleteError: () => toast.error("Failed to delete project"),
  },
};
