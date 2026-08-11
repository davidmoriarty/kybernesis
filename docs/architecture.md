# Kybernesis Architecture

---

1. Introduction
2. Vision
3. Architectural Principles
4. System Overview
5. Monorepo Structure
6. Package Architecture
7. Authentication
8. Authorization
9. Multi-Tenancy
10. Workspace Model
11. Project Model
12. Task Model
13. Files Architecture
14. API Design
15. Database Design
16. Event System
17. Client Architecture
18. Server Architecture
19. Security
20. Future Architecture

---

## 4. System Overview

```
Browser
    │
React
    │
TanStack Query
    │
Hono API
    │
Packages
    │
Drizzle
    │
PostgreSQL
```

---

## 6. Package Architecture

```
packages/
    auth
    db
    schemas
    shared
```

---

## 7. Authentication

Describe:

* login
* logout
* sessions
* cookies
* session lifecycle

---

## 8. Authorization

Describe the permission hierarchy.

```
Tenant
    ↓
Workspace
        ↓
Project
            ↓
Task
```

Explain how permissions flow.

---

# 9. Multi-Tenancy

This is one of Kybernesis’ defining features.

Explain:
```
acme.kybernesis...

↓

Cloudflare

↓

Worker

↓

Fly

↓

resolveTenant()

↓

tenantId
```

This chapter would explain the architecture rather than the deployment steps.

---

## 10-13

Each major feature gets its own architectural chapter.

For example:
```
Projects

Project Members

Tasks

Files

Events

Comments
```

Each chapter describes:
* data model
* responsibilities
* API
* permissions
* lifecycle

----

## 16. Event System

When you build the activity timeline, document:

```
Event

↓

Workspace Feed

↓

Notifications

↓

Audit Trail
```

This becomes the canonical explanation of how events work.

---

## 20. Future Architecture

This is one thing I almost never see in projects, but I think it’s valuable.

Document ideas like:

* plugins
* AI assistants
* automation engine
* search indexing
* knowledge graph
* document versioning

It explains where the architecture is intended to evolve without implying those features already exist.

I also see a nice separation emerging between the three docs

deployment.md

How the application is deployed.

Infrastructure.

---
