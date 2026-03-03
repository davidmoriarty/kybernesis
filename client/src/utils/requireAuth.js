// client/src/utils/requireAuth.ts
import { redirect } from "@tanstack/react-router";
import { rpc } from "@/lib/rpc";
export async function requireAuth() {
  const res = await rpc.$get("/auth/me", { credentials: "include" });
  if (res.status === 401) {
    throw redirect({ to: "/login" });
  }
  if (res.status === 403) {
    throw redirect({ to: "/403" });
  }
  if (!res.ok) {
    throw redirect({ to: "/500" });
  }
  // Safe to parse now
  const data = await res.json();
  return data;
}
