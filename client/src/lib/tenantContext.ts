// client/src/lib/tenantContext.ts

import type { HostContext } from "shared";

type TenantContextResponse = HostContext & {
  tenantId: string | null;
};

function getServerBaseUrl(): string {
  const { protocol, hostname } = window.location;

  if (import.meta.env.MODE === "development") {
    return `${protocol}//${hostname}:3000`;
  }

  const serverUrl = import.meta.env.VITE_SERVER_URL;

  if (!serverUrl) {
    throw new Error("VITE_SERVER_URL is not set.");
  }

  return serverUrl;
}

export async function getTenantContext(): Promise<TenantContextResponse> {
  const response = await fetch(`${getServerBaseUrl()}/tenant-context`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to resolve tenant context.");
  }

  return response.json();
}
