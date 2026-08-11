# Kybernesis Deployment

## Overview

Kybernesis follows the standard BHVR deployment architecture.

See:

BHVR/docs/deployment.md

---

## Deployment Configuration

Application Name:
Kybernesis

Fly App:
kybernesis-server

Cloudflare Pages Project:
kybernesis-client

Cloudflare Worker:
kybernesis-api-proxy

Production Domain:
kybernesis.davidmoriarty.dev

Tenant Domain:
*.kybernesis.davidmoriarty.dev

Database:
Neon PostgreSQL

Storage:
Cloudflare R2

---

## Environment Variables

Server

DATABASE_URL
BASE_DOMAIN
CLIENT_ORIGIN
SESSION_SECRET
NODE_ENV=development
STORAGE_DRIVER=r2
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET

Client

VITE_API_URL=/api
VITE_APP_UEL=https://kybernesis.davidmoriarty.dev

---

## DNS

kybernesis
    CNAME
    kybernesis-client.pages.dev

*kybernesis
    CNAME
    kybernesis-client.pages.dev


---

## Worker

Worker:
kybernesis-api-proxy

Purpose:
Reverse proxy /api requests to Fly.io while preserving tenant hostnames.

---

## Verification

```zsh
curl https://kybernesis-server.fly.dev/_info

curl \
  -H "Host: acme.kybernesis.davidmoriarty.dev" \
  https://kybernesis-server.fly.dev/debug/tenant

curl -I https://acme.kybernesis.davidmoriarty.dev
```

---

## Deployment History

2026-06-24

✓ Fly deployed
✓ Cloudflare Pages deployed
✓ Worker proxy added
✓ Wildcard DNS configured
✓ Wildcard SSL configured
✓ CORS updated
✓ Tenant routing verified
✓ Login verified

---
