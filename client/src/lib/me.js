import { meQueryOptions } from "@/hooks/auth";
export function getMe(queryClient) {
  return queryClient.ensureQueryData(meQueryOptions());
}
