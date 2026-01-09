// client/src/hooks/auth.ts
import type { User, Workspace } from "@shared";
import {
  queryOptions,
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

/* ✅ SHARED QUERY OPTIONS */
export const meQueryOptions = () =>
  queryOptions({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await rpc.auth.me.$get({
        credentials: "include",
      });

      return parseOrThrow<{
        user: Pick<User, "id" | "email">;
        workspace?: Pick<Workspace, "id" | "name"> & {
          role: "admin" | "member";
        };
      }>(res);
    },
  });

/* ✅ HOOK BUILT ON TOP */
export function useMe() {
  return useQuery(meQueryOptions());
}

export function useSignup() {
  const qc = useQueryClient();

  return useMutation<
    { message: string },
    unknown,
    { email: string; password: string }
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
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
