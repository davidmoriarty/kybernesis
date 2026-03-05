// packages/db/src/index.ts
export { db } from "./dbInstance";

export * from "./constants";
export * as Flows from "./flows";
export * as Mappers from "./mappers";
export * as Types from "./types";

export * as ProjectMembers from "./projectMembers";
export * as Projects from "./projects";
export * as Sessions from "./sessions";
export * as TenantMembers from "./tenantMembers";
export * as Tenants from "./tenants";
export * as Users from "./users";
export * as WorkspaceMembers from "./workspaceMembers";
export * as Workspaces from "./workspaces";

// Optional: re-export tables if you want
export * as Schema from "./schema";
