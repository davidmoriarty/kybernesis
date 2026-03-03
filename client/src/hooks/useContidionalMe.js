// client/src/hooks/useConditionalMe.ts
import { useLocation } from "@tanstack/react-router";
import { useMe } from "./auth";
export function useConditionalMe() {
  const location = useLocation();
  const publicPages = ["/", "/login", "/signup"];
  const skip = publicPages.includes(location.pathname);
  return useMe({
    enabled: !skip,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
