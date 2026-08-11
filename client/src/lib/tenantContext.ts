// client/src/lib/tenantContext.ts

import type { HostContext } from "shared";

type TenantContextResponse = HostContext & {
  tenantId: string | null;
};

export async function getTenantContext(): Promise<TenantContextResponse> {
  const response = await fetch("/api/tenant-context", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to resolve tenant context.");
  }

  return response.json();
}
