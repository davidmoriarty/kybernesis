// client/src/hooks/auth.ts
import type { Users, Workspaces } from "@shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useMe() {
  return useQuery<{
    user: Pick<Users.UserRow, "id" | "email">;
    workspace?: Pick<Workspaces.WorkspaceRow, "id" | "name"> & {
      role: "admin" | "member";
    };
  }>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await rpc.auth.me.$get({
        credentials: "include",
      });
      return parseOrThrow(res);
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
