// packages/shared/src/types/tenant.ts

export type Surface = "public" | "tenant" | "admin";

export type HostContext = {
  surface: Surface;
  tenantSlug: string | null;
};
