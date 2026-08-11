// client/src/lib/tenantHost.ts

import type { HostContext } from "shared";

export function parseHostContext(hostname: string): HostContext {
  const normalizedHostname = hostname.trim().toLowerCase();

  if (!normalizedHostname || normalizedHostname === "localhost") {
    return { surface: "public", tenantSlug: null };
  }

  if (normalizedHostname.endsWith(".localhost")) {
    const prefix = normalizedHostname.slice(0, -".localhost".length);
    const parts = prefix.split(".").filter(Boolean);

    if (parts.length === 1) {
      return { surface: "tenant", tenantSlug: parts[0] ?? null };
    }

    if (parts.length === 2 && parts[0] === "admin") {
      return { surface: "admin", tenantSlug: parts[1] ?? null };
    }

    return { surface: "tenant", tenantSlug: prefix || null };
  }

  const baseDomain = import.meta.env.VITE_BASE_DOMAIN?.trim().toLowerCase();

  if (!baseDomain || normalizedHostname === baseDomain) {
    return { surface: "public", tenantSlug: null };
  }

  if (!normalizedHostname.endsWith(`.${baseDomain}`)) {
    return { surface: "public", tenantSlug: null };
  }

  const prefix = normalizedHostname.slice(0, -(baseDomain.length + 1));
  const parts = prefix.split(".").filter(Boolean);

  if (parts.length === 1) {
    return { surface: "tenant", tenantSlug: parts[0] ?? null };
  }

  if (parts.length === 2 && parts[0] === "admin") {
    return { surface: "admin", tenantSlug: parts[1] ?? null };
  }

  return { surface: "tenant", tenantSlug: prefix || null };
}

export function getCurrentHostContext(): HostContext {
  return parseHostContext(window.location.hostname);
}
