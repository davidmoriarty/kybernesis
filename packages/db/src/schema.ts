// packages/db/src/schema.ts
import { createProjectsTable } from "./projects";
import { createSessionsTable } from "./sessions";
import { createUsersTable } from "./users";
import { createWorkspaceMembersTable } from "./workspaceMembers";
import { createWorkspacesTable } from "./workspaces";

export function createTables() {
  createUsersTable();
  createWorkspacesTable();
  createWorkspaceMembersTable();
  createSessionsTable();
  createProjectsTable();
}
