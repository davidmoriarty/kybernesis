import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import { appToast } from "@/lib/toast";
/** ✅ SHARED QUERY OPTIONS HELPER */
export const meQueryOptions = () => ({
  queryKey: ["me"],
  queryFn: async () => {
    try {
      const res = await rpc.$get("/auth/me", { credentials: "include" });
      return parseOrThrow(res);
    } catch {
      // Logged-out state is valid data
      return {};
    }
  },
  retry: false,
});
// HOOK BUILT ON TOP OF THE HELPER
export function useMe(options) {
  return useQuery({
    ...meQueryOptions(),
    ...options,
  });
}
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$put("/auth/me", { body, credentials: "include" });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      appToast.auth.profileUpdateSuccess();
    },
    onError: () => {
      appToast.auth.profileUpdateError();
    },
  });
}
export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$post("/auth/signup", {
        body,
        credentials: "include",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      appToast.auth.signupSuccess();
    },
    onError: () => {
      appToast.auth.signupError();
    },
  });
}
export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$post("/auth/login", {
        body,
        credentials: "include",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      appToast.auth.loginSuccess();
    },
    onError: () => {
      appToast.auth.loginError();
    },
  });
}
export function useLogout() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    retry: false,
    mutationFn: async () => {
      const res = await rpc.$post("/auth/logout", {
        credentials: "include",
      });
      return parseOrThrow(res, { message: "" });
    },
    onSuccess: async () => {
      // stop any in-flight /me, /projects, /project/:id refetches
      await qc.cancelQueries();
      // clear auth-scoped data (adjust keys to match your app)
      qc.removeQueries({ queryKey: ["me"] });
      qc.removeQueries({ queryKey: ["projects"] });
      qc.removeQueries({ queryKey: ["project"] });
      qc.removeQueries({ queryKey: ["workspaces"] });
      appToast.auth.logoutSuccess();
      // leave protected routes
      navigate({ to: "/login", replace: true });
    },
    onError: () => {
      appToast.auth.logoutError();
    },
  });
}
