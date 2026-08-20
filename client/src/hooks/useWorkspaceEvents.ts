// client/src/hooks/useWorkspaceEvents.ts

import { useQuery } from "@tanstack/react-query";
import type { RpcError } from "@/lib/rpcError";
import { parseOrThrow } from "@/lib/parseOrThrow";
import { rpc } from "@/lib/rpc";

export type WorkspaceEvent = {
  id: string;
  workspace_id: string;
  actor_id: string | null;
  actorName: string | null;
  entityType: string;
  entityId: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export function useWorkspaceEvents(workspaceId: string, enabled = true) {
  return useQuery<WorkspaceEvent[], RpcError>({
    queryKey: ["workspaceEvents", workspaceId],
    enabled: enabled && Boolean(workspaceId),
    queryFn: async () => {
      const res = await rpc.$get(`/workspaces/${workspaceId}/events`, {
        credentials: "include",
      });
      return parseOrThrow<WorkspaceEvent[]>(res, []);
    },

    retry: false,
  });
}
