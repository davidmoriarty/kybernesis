# Kybernesis

Kybernesis is a multi-tenant SaaS platform for software teams and individual developers.

It provides project organization, team collaboration, and structured development workflows — built with a Bun-first, full-stack TypeScript architecture.

## Overview

Kybernesis is designed to support:

- Multiple organizations (tenants)
- Team-based collaboration
- Project-level isolation
- Role-based access control
- Secure authentication
- Structured development workflows

Each tenant operates within an isolated scope while sharing a unified infrastructure.

## Core Concepts

### Multi-Tenancy

- Organization-based data isolation
- Tenant-scoped resources (projects, tasks, files)
- Secure access boundaries
- Shared infrastructure with logical separation

### Projects

- Workspace containers for development efforts
- Sections for Overview, Files, Tasks, Timeline, and Settings
- Extensible domain model

### Users & Teams

- Authenticated users
- Organization membership
- Role-based permissions
- Owner / Admin / Member access patterns
	
## Architecture

Kybernesis is built as a strict TypeScript monorepo:

- Bun – runtime + package manager
- Hono – backend API
- React + Vite – frontend UI
- Drizzle ORM – database layer
- Turbo – monorepo orchestration
- Biome – linting & formatting

## Monorepo Structure

```bash
.
├── client/                 # React frontend
├── server/                 # Hono backend
├── packages/
│   ├── db/                 # Database schema + seed
│   ├── auth/               # Authentication logic
│   ├── shared/             # Shared types
│   └── schemas/            # Validation schemas
├── package.json
└── turbo.json
```

## Backend

The server is built with Hono and structured around:

- JWT authentication
- Refresh token rotation
- Tenant-aware middleware
- Organization-scoped queries
- Modular route organization

Example route:
```typescript
app.get("/api/projects", authMiddleware, async (c) => {
  const user = c.get("user")
  const projects = await getProjectsForTenant(user.tenantId)
  return c.json(projects)
})
```

All database access is tenant-scoped.

## Frontend

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

### Security Model

- HTTP-only refresh cookies
- Access token rotation
- Tenant-scoped database queries
- Server-side authorization checks
- No client-trusted permissions

### Development

Install dependencies:
```bash
bun install
```

Run in development:
```bash
bun run dev
```

Or individually:
```bash
bun run dev:client
bun run dev:server
```

## Build

```bash
bun run build
```

## Deployment

Client and server deploy independently:

Client
- Cloudflare Pages
- Static hosting

Server
- Fly.io
- Bun runtime
- Node.js

Environment variables control database, JWT secrets, and tenant configuration.

---

## Design Goals

Kybernesis aims to be:

- Strictly typed end-to-end
- Cleanly structured
- Production-oriented
- Deployment-flexible
- Auth-first
- Multi-tenant by design

## Status

Active development.

Core infrastructure:
- Authentication
- Multi-tenant database structure
- Project management UI shell

Next phases:
- File handling
- Activity timelines
- Role-based management UI
- Billing integration (future)
