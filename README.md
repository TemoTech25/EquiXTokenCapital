# EquiXToken Capital

EquiXToken Capital is a full-stack platform that transforms African real estate transactions into programmable digital assets. It delivers:

* **Transfer Automation** – orchestrates the entire OTP ➜ KYC ➜ escrow ➜ municipal certificates ➜ deeds registration pipeline with role-based workspaces for conveyancers, municipalities, banks, and buyers/sellers.
* **Tokenisation Studio** – mints Hedera HTS NFT “Title Twins” and KYC-gated FT fractions for SPV shares, enabling fractional ownership and compliance-aware liquidity.
* **Payments & Escrow** – programmable bank and stablecoin escrows with multi-party approvals, Hedera smart-contract releases, and auditable statements.
* **Document / Compliance Hub** – AI-assisted document checks, KYC/KYB policy engine, HCS anchoring for immutable audit trails, and S3-backed encrypted storage.

The repository is organised as a monorepo:

```
/
├── backend      # Node.js (Express + Prisma) API
├── frontend     # Next.js 14 + React 18 + Tailwind + shadcn/ui
├── contracts    # Solidity smart contracts (tokenisation, escrow, registry)
├── docs         # Product / UX documentation
├── infra        # Provisioning scripts / Terraform (WIP)
└── scripts      # Hedera deployment, Solidity compilation helpers, etc.
```

---

## Architecture Overview

| Layer            | Tech Stack/Role                                                                                                                 |
|------------------|----------------------------------------------------------------------------------------------------------------------------------|
| **Frontend**     | Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui. Provides multi-tenant, role-aware SaaS experience.      |
| **Backend**      | Node.js (Express) + TypeScript + Prisma ORM. Exposes REST APIs for cases, documents, escrow, tokens, compliance, and wallet auth. |
| **Database**     | PostgreSQL (Prisma-managed schema for tenants, cases, documents, escrow, tokens, offerings, audits, etc.).                      |
| **Cache / Queue**| Redis Cloud (session cache, idempotency tracking, future task queues).                                                           |
| **Storage**      | S3-compatible bucket for encrypted document storage; metadata + hashing via Hedera HCS.                                          |
| **Blockchain**   | Hedera Hashgraph stack:                                                                                                         |
|                  | • HTS (tokenisation: NFT title twins, FT fractional shares)                                                                     |
|                  | • Smart Contracts Service (programmable escrow / distributions)                                                                 |
|                  | • Consensus Service (HCS) for immutable event and document hash logs                                                             |
|                  | • Mirror Node REST for state / audit queries                                                                                    |
| **AI Services**  | Pluggable endpoints for document checks, KYC decisioning, policy explanations (default stubs until provider keys supplied).     |

### Why Hedera?

1. **Finality + Throughput** – predictable 3-5 second finality with low fees, ideal for real estate workflows that require immutable audit trails.
2. **Token Service simplicity** – HTS handles mint/burn/freeze/whitelist logic out of the box (no custom ERC-20/721 smart contracts to audit).
3. **Sustainability** – carbon negative public network that aligns with ESG commitments (crucial for African property projects).
4. **Native HCS + Smart Contracts** – HCS provides tamper-proof logging for KYC events, document hashes, escrow milestones; smart contracts enforce release conditions.

---

## Quickstart

### Prerequisites

Install the following locally:

* **Node.js** ≥ 20.x and **npm** ≥ 9.x
* **PostgreSQL** ≥ 14 (cloud or local). If using Supabase/Neon/etc., have the connection string ready.
* **Redis** (local or cloud). Redis Cloud Essentials (as in the screenshot) works great.
* **Git** ≥ 2.34
* **Hedera Testnet credentials** – Operator account ID + private key for deploying contracts and minting tokens.
* **Wallet (HashPack)** – Chrome extension or desktop app for user pairing.
* Optional: Docker (if you want to run Postgres/Redis locally via containers).

### Repository Setup

```bash
git clone https://github.com/<your-org>/EquiXTokenCapital.git
cd EquiXTokenCapital
```

Install dependencies:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Environment Configuration

Create `.env` files in both `backend/` and `frontend/`. Examples:

`backend/.env`

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
REDIS_URL=redis://default:REDIS_PASSWORD@HOST:PORT

JWT_SECRET=replace-with-strong-secret
IDEMPOTENCY_TTL_SECONDS=86400
REFRESH_TOKEN_TTL_SECONDS=604800

HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxxxx
HEDERA_OPERATOR_KEY=302e020100300506032b657004220420xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
HASHCONNECT_APP_METADATA_NAME="EquiXToken Capital"
HASHCONNECT_APP_METADATA_DESCRIPTION="Real Estate Tokenization Platform"
HASHCONNECT_APP_METADATA_ICON="https://equix.capital/icon.png"
HASHCONNECT_APP_METADATA_URL="https://equix.capital"

S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret
S3_BUCKET=equix-docs

KYC_PROVIDER_API_KEY=replace-if-available
AI_SERVICE_ENDPOINT=https://ai.internal/equix

FEATURE_MARKETPLACE=true
FEATURE_CUSTODIAL_WALLETS=true
FEATURE_GUARDIAN=false
```

`frontend/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_HASHCONNECT_APP_NAME=EquiXToken Capital
NEXT_PUBLIC_HASHCONNECT_APP_DESCRIPTION=Real Estate Tokenization Platform
NEXT_PUBLIC_HASHCONNECT_APP_ICON=https://equix.capital/icon.png
NEXT_PUBLIC_HASHCONNECT_APP_ID=your-hashconnect-app-id
NEXT_PUBLIC_TENANT_ID=default-tenant
```

> **Note:** Replace placeholders with the credentials you provision (Supabase, Redis Cloud, AWS S3, etc.).

### Database Migration & Prisma Client

Once PostgreSQL is reachable:

```bash
cd backend
npx prisma migrate dev --schema src/db/schema.prisma --name init
npx prisma generate --schema src/db/schema.prisma
```

This sets up tables for tenants, cases, documents, escrow, tokens, offerings, audits, etc.

### Running Backend + Frontend

In one terminal:

```bash
cd backend
npm run dev
```

In another:

```bash
cd frontend
npm run dev
```

Visit **http://localhost:3000** to access the application. The backend listens on **http://localhost:4000** by default.

---

## Hedera REST & Smart Contract Endpoints

The backend interacts with Hedera services via the following REST/gRPC endpoints:

| Service | Endpoint                                                                 | Purpose                                                              |
|---------|--------------------------------------------------------------------------|----------------------------------------------------------------------|
| Mirror Node REST | `https://testnet.mirrornode.hedera.com/api/v1`                         | Query transactions, token balances, event logs for compliance audits |
| HTS             | SDK interactions via `@hashgraph/sdk`                            | Mint/burn/freeze title twins & fractions                             |
| Smart Contracts | SDK → `ContractCreateTransaction` / `ContractExecuteTransaction` | Deploy & call escrow, registry, revenue distribution contracts        |
| Consensus (HCS) | `TopicMessageSubmitTransaction`                                  | Append hashes of OTP/KYC docs, escrow milestones, AI decisions        |

Smart-contract deployment scripts live under `backend/scripts/hedera-deploy.ts`. To deploy:

```bash
cd backend
npm run compile      # compile Solidity -> artifacts
npm run hedera:deploy
```

This uploads bytecode to HFS, creates contracts, mints mock tokens, and writes deployment manifests to `backend/deployments/`.

---

## Development Scripts

| Command                         | Description                                                 |
|---------------------------------|-------------------------------------------------------------|
| `npm run dev` (frontend/backend)| Start development servers                                   |
| `npm run build`                 | Build production bundle                                     |
| `npm run lint`                  | ESLint checks                                               |
| `npm run compile` (backend)     | Compile Solidity contracts via `scripts/compile-contracts`  |
| `npm run hedera:deploy`         | Deploy compiled contracts to Hedera                         |
| `npm run prisma:migrate`        | (alias) Apply Prisma migrations once database is set        |

---

## Roadmap & Next Steps

* **Wallet Auth** – Complete HashConnect pairing -> backend session -> JWT storage.
* **Escrow UX** – embed creation wizard, funding/statement actions in case detail pages.
* **Doc/KYC AI integrations** – connect real S3 + provider APIs (defaults are stubbed).
* **Automated Tests + CI** – add backend unit/integration tests, frontend component/E2E tests, and CI workflows (GitHub Actions example coming).
* **Deployment Playbook** – containerise backend/frontend, configure infra (Postgres, Redis, S3, Hedera secrets) via Terraform/Helm.

---

## Contributing

1. Fork or clone the repo.
2. Create a feature branch (`git checkout -b feature/my-update`).
3. Add tests/documentation where relevant.
4. Submit a PR describing the change and include screenshots for UI work.

Please open GitHub issues for bugs or feature requests.

---

## License

Proprietary – © EquiXToken Capital. All rights reserved. Contact the team for partnership and commercial licensing inquiries.

