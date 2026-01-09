// client/src/lib/me.ts
import type { QueryClient } from "@tanstack/react-query";
import { meQueryOptions } from "@/hooks/auth";

export function getMe(queryClient: QueryClient) {
  return queryClient.ensureQueryData(meQueryOptions());
}
