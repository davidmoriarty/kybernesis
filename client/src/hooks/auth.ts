// client/src/hooks/auth.ts
import type { User, Workspace } from "@shared";
import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import { rpcErrorFromResponse } from "@/lib/rpcError";

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res
    .clone()
    .json()
    .catch(() => undefined);
  if (!res.ok) throw rpcErrorFromResponse(res, body);
  return body as T;
}

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
      const res = await rpc.auth.me.$get({ credentials: "include" });
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
    unknown,
    { name: string; email: string; password: string }
  >({
    mutationFn: async (body) => {
      const res = await rpc.auth.signup.$post({
        json: body,
        credentials: "include",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation<
    { message: string },
    unknown,
    { email: string; password: string }
  >({
    mutationFn: async (body) => {
      const res = await rpc.auth.login.$post({
        json: body,
        credentials: "include",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation<{ message: string }, unknown, void>({
    mutationFn: async () => {
      const res = await rpc.auth.logout.$post({
        credentials: "include",
      });
      return parseOrThrow(res);
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["me"] });
    },
  });
}
