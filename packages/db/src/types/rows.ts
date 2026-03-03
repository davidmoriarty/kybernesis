// packages/db/src/types/rows.ts
import type { projects } from "../projects";
import type { sessions } from "../sessions";
import type { tenantMembers } from "../tenantMembers";
import type { tenants } from "../tenants";
import type { users } from "../users";
import type { workspaceMembers } from "../workspaceMembers";
import type { workspaces } from "../workspaces";

export type TenantRow = typeof tenants.$inferSelect;
export type NewTenantRow = typeof tenants.$inferInsert;

export type TenantMemberRow = typeof tenantMembers.$inferSelect;
export type NewTenantMemberRow = typeof tenantMembers.$inferInsert;

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;

export type WorkspaceRow = typeof workspaces.$inferSelect;
export type NewWorkspaceRow = typeof workspaces.$inferInsert;

export type WorkspaceMemberRow = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMemberRow = typeof workspaceMembers.$inferInsert;

export type WorkspaceRowSummary = Pick<
  WorkspaceRow,
  "id" | "name" | "tenantId"
>;
export type WorkspaceRowSummaryWithRole = WorkspaceRowSummary & {
  role: WorkspaceMemberRow["role"];
};

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;

export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
