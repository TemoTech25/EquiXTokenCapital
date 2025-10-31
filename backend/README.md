# EquiXToken Capital Backend

Secure, event-driven Node.js monolith implementing transfer automation, tokenisation, escrow, and marketplace services for EquiXToken Capital.

## Getting Started

1. Install dependencies (Node 20+):
   ```bash
   cd backend
   npm install
   ```
2. Copy environment template and configure secrets:
   ```bash
   cp .env.example .env
   ```
3. Generate Prisma client & run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Start services (PostgreSQL, Redis, S3-compatible) – use your local infrastructure or cloud instances.
5. Launch the API:
   ```bash
   npm run dev
   ```

## Project Structure

```
backend/
  package.json
  tsconfig.json
  src/
    app/               # Express app factory
    config/            # Env schema & loaders
    db/                # Prisma schema, migrations
    lib/               # Shared utilities (logger, jwt, redis, etc.)
    modules/           # Domain modules (auth, cases, tokens, ...)
    routes/            # HTTP routers per module
    workers/           # Queue consumers & schedulers (todo)
```

## Key Concepts

- **Multi-tenant**: every request resolves tenant config & policies before executing business logic.
- **Hedera Integration**: wrappers under `modules/hedera` encapsulate HTS/HCS/HFS/SCS usage.
- **Event Outbox**: reliable delivery of anchoring/webhook events via `EventOutbox` table + workers.
- **Idempotency**: header `Idempotency-Key` required for critical POST/PATCH operations (to be enforced in middleware).
- **Security**: JWT auth, RBAC middleware, audit trails, POPIA/GDPR compliance (hashes on-chain; PII off-chain).

## Next Steps

- Implement tenant resolution middleware and RBAC guards.
- Flesh out module controllers/services with real logic (Prisma, Hedera, integrations).
- Add workers for outbox processing, HCS anchoring, and scheduled tasks.
- Write unit/integration tests under `src/tests` (Vitest).

Refer to the architectural spec for detailed behaviours (case lifecycle, escrow, tokenisation, marketplace, compliance, etc.).
