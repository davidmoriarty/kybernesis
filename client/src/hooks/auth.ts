// client/src/hooks/auth.ts

import type {
  User,
  Workspace,
  MeResponse,
  UpdateProfileResponse,
} from "@shared";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";
import { appToast } from "@/lib/toast";

export type MeResult = {
  user?: Pick<
    User,
    | "id"
    | "email"
    | "name"
    | "createdAt"
    | "updatedAt"
    | "nickname"
    | "timezone"
    | "location"
    | "avatar"
  >;
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

      const data = await parseOrThrow<MeResponse>(res);

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
          nickname: data.user.nickname,
          timezone: data.user.timezone,
          location: data.user.location,
          avatar: data.user.avatar,
        },
        workspace: data.workspace
          ? {
              id: data.workspace.id,
              name: data.workspace.name,
              role: data.workspace.role,
            }
          : undefined,
      };
    } catch {
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

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation<
    UpdateProfileResponse,
    Error,
    {
      name: string;
      email: string;
      nickname?: string;
      timezone?: string;
      location?: string;
      avatar?: string;
    }
  >({
    retry: false,
    mutationFn: async (body) => {
      const res = await rpc.$put("/auth/me", { body, credentials: "include" });
      return await parseOrThrow<UpdateProfileResponse>(res);
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
  const navigate = useNavigate();

  return useMutation<{ message: string }, Error, void>({
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
