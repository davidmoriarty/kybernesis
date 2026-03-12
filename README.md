# Kybernesis

![Bun](https://img.shields.io/badge/runtime-Bun-000000?logo=bun)
![Hono](https://img.shields.io/badge/API-Hono-orange)
![React](https://img.shields.io/badge/UI-React-61dafb?logo=react)
![Drizzle](https://img.shields.io/badge/ORM-Drizzle-0c7b93)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)

*A multi-tenant SaaS platform for organizing software projects, tasks, and team collaboration.*

Kybernesis is a developer-focused platform designed to support structured project workflows across teams and organizations.

Built with a Bun-first full-stack TypeScript architecture, it provides project organization, task management, and secure multi-tenant collaboration.

---

# Overview

Kybernesis is designed to support:

- Multiple organizations (tenants)
- Team-based collaboration
- Project-level isolation
- Role-based access control
- Task management within projects
- Secure authentication
- Structured development workflows

Each tenant operates within an isolated scope while sharing a common infrastructure.

---

# System Model

```
Tenant
└─ Workspaces
   └─ Projects
      └─ Tasks
         └─ Activity Events
```

---

# Core Concepts

## Multi-Tenancy

- Organization-based data isolation
- Tenant-scoped resources (projects, tasks, files)
- Secure access boundaries
- Shared infrastructure with logical separation

## Projects

Projects are the primary container for work inside a workspace.

Each project supports:

- Project members and roles
- Task management
- Activity events
- Extensible sections (Files, Timeline, etc.)

## Tasks

Tasks represent units of work within a project.

Features include:

- Project-scoped task lists
- Member assignment
- Status tracking (`todo`, `in_progress`, `done`)
- Task updates and deletion
- Activity events for task actions

## Users & Teams

- Authenticated users
- Organization membership
- Role-based permissions
- Owner / Admin / Member access patterns

---

# Architecture

Kybernesis is built as a strict TypeScript monorepo:

- **Bun** — runtime and package manager
- **Hono** — backend API
- **React + Vite** — frontend UI
- **Drizzle ORM** — database layer
- **Turbo** — monorepo orchestration
- **Biome** — linting and formatting

---

# Key Architecture Decisions

## Multi-Tenant First Architecture

Kybernesis is designed from the ground up as a multi-tenant system.

All core entities are tenant-scoped through workspace and project relationships, ensuring:

- Strong isolation between organizations
- Secure authorization boundaries
- Scalable shared infrastructure

Tenant context is enforced through middleware and database queries.

---

## Server-Side Authorization

All permissions are enforced server-side using RBAC middleware.

Roles currently include:

- `admin`
- `member`

Authorization is validated at multiple levels:

- Workspace membership
- Project membership
- Role-based permissions

No client-side permissions are trusted.

---

## Event-Driven Activity Logging

Kybernesis uses a structured event system to track project activity.

Events are recorded for operations such as:

- Project creation and updates
- Membership changes
- Task creation and status changes

This enables future features like:

- Activity feeds
- Audit trails
- Notifications
- Timeline views

---

## End-to-End Type Safety

The platform is built with strict TypeScript across the entire stack:

- Shared types between client and server
- Database schema defined with Drizzle ORM
- Typed API responses
- Runtime validation via schema packages

This reduces runtime errors and improves maintainability.

---

# Monorepo Structure

```bash
.
├── client/                 # React frontend
├── server/                 # Hono backend
├── packages/
│   ├── db/                 # Database schema
│   ├── auth/               # Authentication logic
│   ├── shared/             # Shared types
│   └── schemas/            # Validation schemas
├── package.json
└── turbo.json
```

---

# Backend

The server is built with Hono and structured around:

- JWT authentication
- Refresh token rotation
- Tenant-aware middleware
- Organization-scoped queries
- Modular route organization

Example route:

```ts
app.get("/api/projects", authMiddleware, async (c) => {
  const user = c.get("user")
  const workspace = c.get("workspace")

  const projects = await getProjectsForWorkspace({
    tenantId: user.tenantId,
    workspaceId: workspace.id
  })

  return c.json({ projects })
})
```

The API includes endpoints for:

- Authentication
- Workspaces
- Projects
- Project membership
- Task management

All database access is tenant-scoped.

---

# Frontend

The frontend is built with:

- React
- TanStack Router
- TanStack Query
- shadcn/ui
- Tailwind CSS

Features include:

- Auth-gated routes
- Section-based project UI
- Sidebar-driven navigation
- Optimistic UI patterns
- Token refresh handling

---

# Security Model

- HTTP-only refresh cookies
- Access token rotation
- Tenant-scoped database queries
- Server-side authorization checks
- No client-trusted permissions

---

# Development

Install dependencies:

```bash
bun install
```

Run in development:

```bash
bun run dev
```

Or run services individually:

```bash
bun run dev:client
bun run dev:server
```

---

# Build

```bash
bun run build
```

---

# Deployment

Client and server deploy independently.

Client:

- Cloudflare Pages
- Static hosting

Server:

- Fly.io
- Bun runtime

Environment variables control database connections, JWT secrets, and tenant configuration.

---

# Design Goals

Kybernesis aims to be:

- Strictly typed end-to-end
- Cleanly structured
- Production-oriented
- Deployment-flexible
- Auth-first
- Multi-tenant by design

---

# Milestones

**v0.5.0** — Project system  
Projects created within workspaces with tenant-scoped queries.

**v0.6.0** — Role-based access control  
Project membership, admin/member roles, and permission middleware.

**v0.7.0** — Activity event system  
Structured activity logging for project actions.

**v0.8.0** — Task management  
Project-scoped task CRUD with assignment and status tracking.

---

# Status

Active development.

Core infrastructure implemented:

- Authentication (JWT + refresh rotation)
- Multi-tenant database architecture
- Workspace and project structure
- Project membership & RBAC
- Activity event logging
- Task management system

Next phases:

- Task board / Kanban interface
- File handling
- Activity timelines
- Role-based management UI
- Billing integration (future)
