// client/src/hooks/auth.ts
import type { User, Workspace } from "@shared";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import { appToast } from "@/lib/toast";

export type MeResult = {
  user?: Pick<User, "id" | "email" | "name">;
  workspace?: Pick<Workspace, "id" | "name"> & {
    role: "admin" | "member";
  };
};

/** ✅ SHARED QUERY OPTIONS HELPER */
export const meQueryOptions = () => ({
  queryKey: ["me"] as const,
  queryFn: async (): Promise<MeResult> => {
    try {
      const res = await rpc.$get("/auth/me", { credentials: "include" });
      return parseOrThrow<MeResult>(res);
    } catch {
      // Logged-out state is valid data
      return {};
    }
  },
  retry: false,
});

// HOOK BUILT ON TOP OF THE HELPER
export function useMe(
  options?: Omit<
    UseQueryOptions<MeResult, Error, MeResult>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    ...meQueryOptions(),
    ...options,
  });
}

export function useSignup() {
  const qc = useQueryClient();

  return useMutation<
    { message: string },
    Error,
    { name: string; email: string; password: string }
  >({
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

  return useMutation<
    { message: string },
    Error,
    { email: string; password: string }
  >({
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

  return useMutation<{ message: string }, Error, void>({
    retry: false,
    mutationFn: async () => {
      const res = await rpc.$post("/auth/logout", {
        credentials: "include",
      });
      return parseOrThrow(res, { message: "" });
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["me"] });
      appToast.auth.logoutSuccess();
    },
    onError: () => {
      appToast.auth.logoutError();
    },
  });
}
