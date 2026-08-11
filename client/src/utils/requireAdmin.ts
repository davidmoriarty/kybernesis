// client/src/utils/requireAdmin.ts

import { redirect } from "@tanstack/react-router";
import type { MeResponse } from "shared";
import { rpc } from "@/lib/rpc";

export async function requireAdmin() {
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

  const data = (await res.json()) as MeResponse;

  if (data.tenantRole !== "owner" && data.tenantRole !== "admin") {
    throw redirect({ to: "/403" });
  }

  return data;
}
