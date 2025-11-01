# EquiXToken Capital

> **Revolutionising real estate ownership and transfers through tokenisation, AI, and Hedera Hashgraph.**

EquiXToken Capital is a blockchain-powered SaaS platform that transforms how property is bought, sold, financed, and owned. We are building the digital rails for the real-estate economy—delivering property tokenisation, automated transfer workflows, digital title deeds, and fractional investment, all secured on Hedera Hashgraph.

Our mission is to reduce the cost and friction of property transactions, automate complex legal workflows, and make property ownership accessible to everyone—from conveyancers and developers to diaspora investors.

---

## 📦 What’s in the Repository?

```
/
├── backend      # Node.js (Express/Fastify-style) API, Prisma ORM, Hedera + S3 integrations
├── frontend     # Next.js 14 + React 18 + TailwindCSS + shadcn/ui multi-tenant SaaS
├── contracts    # Solidity smart contracts (tokenisation, escrow, compliance buses)
├── docs         # Product briefs, UX specs, compliance notes
├── infra        # Infrastructure-as-code stubs (Terraform/Kubernetes WIP)
├── scripts      # Hedera deployment + Solidity compilation tooling
└── test         # Integration/spec scaffolding (Vitest, Playwright to be expanded)
```

---

## 🌍 Platform Overview

| Layer                      | Description                                                                                                                                      |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| **Property Tokenisation** | Convert real-world property into digital tokens with Hedera HTS (NFT “Title Twins” & FT fractions) so ownership becomes liquid and programmable. |
| **Smart Escrow & Registry** | Hedera Smart Contracts automate fund release once municipal certificates, KYC, and compliance checks complete; registry changes are immutable. |
| **Digital Title Deeds**   | E-signed, legally verifiable deeds stored on Hedera File Service (HFS) with hashes logged on Hedera Consensus Service (HCS).                     |
| **AI Compliance & KYC**   | AI agents (LangChain + Eliza OS) ingest documents, run AML/KYC, and produce audit-ready policy outcomes anchored on-chain.                       |
| **Unified SaaS Workspace**| Conveyancers, municipalities, banks, developers, and investors collaborate in a single, role-aware workbench.                                   |
| **Investment Marketplace**| Fractional property investment, developer fundraising, and stablecoin remittances ( diaspora participation encouraged).                         |

---

## 🧠 Built With

| Layer            | Tools / Services                                                                                               |
|------------------|-----------------------------------------------------------------------------------------------------------------|
| **Frontend**     | Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui                                                        |
| **Backend**      | Node.js, Express-style modules, Prisma ORM, PostgreSQL, Redis                                                   |
| **Blockchain**   | Hedera HTS (tokenisation), HCS (auditing), HFS (document anchoring), Smart Contracts Service (escrow automation)|
| **Wallet**       | HashPack via HashConnect (user pairing, digital signatures)                                                     |
| **AI Layer**     | LangChain, Eliza OS, bespoke compliance agents (plug in KYC providers)                                         |
| **Storage**      | AWS S3-compatible bucket for encrypted document storage                                                         |

---

## ⚙️ Architecture Overview

### Tokenisation Engine
- Converts physical property records into digital assets using HTS.
- Supports both whole-title NFTs (“Title Twins”) and fractional fungible tokens for SPV share classes.
- Enforces compliance via whitelist, transfer restrictions, and holding limits.

### Smart Escrow & Registry Layer
- Hedera Smart Contracts enforce conditional payouts to beneficiaries once legal & municipal checks are satisfied.
- Escrow events & document hashes are anchored to HCS providing an immutable audit trail.
- Case registry synchronises deed registration with token ownership updates.

### AI Compliance Engine
- AI agents orchestrated via LangChain + Eliza OS perform KYC/KYB, AML, sanctions, and document validation.
- Policy results feed into the backend’s Compliance Oracle and are hashed on-chain for evidentiary integrity.

### Marketplace & Capital Raising
- Connects tokenised projects with retail and institutional investors.
- Supports stablecoin rails for diaspora remittances, cross-border compliance, and developer offerings.
- Integrates with custodial sub-wallets for unbanked users (coming in roadmap).

### Digital Title Deed System
- Replaces paper-based deeds with cryptographically verifiable, e-signed records.
- Uses HFS for storage, HCS for timestamped hashing, and the Hedera Mirror node for audit queries.
- Intermediary portal generates post-registration packs and multi-party approvals.

---

## 💡 Why Hedera?

1. **Predictable Finality & Fees** – Hedera offers 3-5 second finality with low fees, ideal for legal-grade workflows that require deterministic settlement.
2. **HTS Native Controls** – Built-in features (freeze, KYC, custom fees, whitelist) minimize bespoke smart contracts and audit overhead.
3. **Carbon Negative & ESG-aligned** – Supports sustainability mandates important to African infrastructure projects.
4. **Consensus + File Services** – HCS and HFS give us tamper-proof timelines and document anchoring, reducing reliance on third-party notaries.

---

## 🚀 Vision & Roadmap

| Phase | Timeline | Focus                                                                                                      |
|-------|----------|------------------------------------------------------------------------------------------------------------|
| Phase 1 (MVP) | 2025 | Tokenisation, smart escrow, compliance AI, digital deeds (current build).                               |
| Phase 2 | 2026 | Launch marketplace, stablecoin remittances, fractional ownership tooling.                                    |
| Phase 3 | 2027 | DeFi lending, global investor onboarding, secondary trading modules.                                         |
| Phase 4 | 2028–2030 | EquiXToken Protocol – global infrastructure for real-estate banking-as-a-service.                       |

**Business Model Highlights**
- Asset tokenisation service fees.
- Transaction fees (escrow releases, title transfers).
- SaaS subscriptions for intermediaries (law firms, developers, municipalities).
- White-label API licensing for enterprise clients.
- Marketplace commissions on investment campaigns / secondary trades.

**Financial Snapshot**

| Year | Revenue | Operating Expenses | Net Income | Cumulative EBIT |
|------|---------|--------------------|------------|-----------------|
| 2025 | $435,000 | $280,000 | $155,000 | $131,750 |
| 2026 | $900,000 | $450,000 | $450,000 | $515,000 |
| 2027 | $1,700,000 | $800,000 | $900,000 | $1,280,000 |

---

## 🏛️ Detailed Feature Matrix

| Module | What Happens | Hedera Touchpoints |
|--------|--------------|--------------------|
| **Case Management** | Conveyancers capture OTP, assign tasks, track municipal certificates, and orchestrate escrow releases. | HCS logs (OTP hash, certificate statuses). |
| **Digital Title Twin** | Post-registration, case updates mint NFT “Title Twins” and fractional FTs on HTS, reflecting new ownership. | HTS issuance, Mirror Node subscription. |
| **Smart Escrow** | Hedera Smart Contracts enforce conditional payouts (banks, municipalities, developers) with multi-sig approvals. | Smart Contract Service + HCS audit logs. |
| **Document Vault** | E-signed deeds, receipts, and certificates stored on S3; hashes anchored on HCS for integrity. | HFS for key docs, HCS for proof-of-existence. |
| **Compliance Hub** | AI agents evaluate KYC/KYB, sanctions, and municipal requirements, writing outcomes to the Compliance Oracle. | HCS hash of decisions; optional DID integration. |
| **Investment Marketplace** | Developers list projects; investors buy fractions; stablecoin/bank rails handle payments. | HTS for token transfers, HCS for offer logs. |
| **Wallet Connect** | HashPack + HashConnect handle user pairing. Backend verifies signatures and issues JWT sessions. | Accounts linked to HTS tokens / escrow interactions. |

---

## 🧰 Developer Quickstart

### Prerequisites

* Node.js v20+
* PostgreSQL (Supabase, Neon, RDS, or local)
* Redis (Redis Cloud Essentials or local)
* HashPack Wallet (extension/app)
* Hedera Testnet operator account (ID & private key)

### Installation

```bash
git clone https://github.com/<your-org>/EquiXTokenCapital.git
cd EquiXTokenCapital

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Variables

`backend/.env`

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
REDIS_URL=redis://default:REDIS_PASSWORD@HOST:PORT

JWT_SECRET=super-strong-secret
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

KYC_PROVIDER_API_KEY=optional-provider-key
AI_SERVICE_ENDPOINT=https://ai.internal/equix
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

### Database & Prisma

```bash
cd backend
npx prisma migrate dev --schema src/db/schema.prisma --name init
npx prisma generate --schema src/db/schema.prisma
```

### Run Services

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm run dev
```

Visit **http://localhost:3000** (frontend) and **http://localhost:4000** (backend APIs).

---

## 🔐 Hedera REST & Smart Contract Endpoints

| Service | Endpoint / Usage | Purpose |
|---------|------------------|---------|
| Mirror Node REST | `https://testnet.mirrornode.hedera.com/api/v1` | Query tokens, transactions, account states for audit trails. |
| Hedera Token Service | `@hashgraph/sdk` `TokenCreateTransaction`, `TokenMintTransaction`, etc. | Mint Title Twins, fractional FT issuance, freeze/whitelist operations. |
| Smart Contracts | `ContractCreateTransaction`, `ContractExecuteTransaction` | Deploy/register escrow & revenue contracts; execute conditional releases. |
| Consensus Service | `TopicMessageSubmitTransaction` | Anchor OTP hashes, compliance decisions, municipal approvals. |
| File Service | `FileCreateTransaction` | Store signed deeds, share certificates alongside encrypted S3 objects. |

Deployment scripts: `backend/scripts/compile-contracts.ts`, `backend/scripts/hedera-deploy.ts`.

```bash
cd backend
npm run compile        # Solidity -> artifacts
npm run hedera:deploy  # Upload bytecode + deploy contracts
```

Deployment outputs are written to `backend/deployments/hedera-<network>.json`.

---

## 🧭 API Overview (selected endpoints)

| Method & Endpoint | Description |
|-------------------|-------------|
| `POST /api/tokenize` | Tokenise a property record (creates HTS token + registry entry). |
| `POST /api/transfer` | Execute smart escrow transfer between buyer/seller after approvals. |
| `POST /api/verify` | Run KYC/compliance checks and log outcome. |
| `GET /api/registry/:id` | Retrieve property registry + title twin metadata. |
| `GET /api/marketplace` | Fetch active investment listings & developer offerings. |
| `GET /api/v1/cases` | Retrieve cases with parties, documents, escrow status. |
| `POST /api/v1/escrows` | Create programmable escrow linked to a case. |
| `POST /api/v1/wallet/session` | Validate HashConnect pairing signature and issue JWT. |

> Full API documentation is auto-generated from the Express routes (Swagger integration planned).

---

## 🧪 Development Scripts

| Command                      | Description |
|------------------------------|-------------|
| `npm run dev` (frontend/backend) | Start development servers |
| `npm run build`              | Build production bundles |
| `npm run lint`               | ESLint check |
| `npm run test` (backend WIP) | Execute unit/integration tests |
| `npm run compile` (backend)  | Compile Solidity contracts |
| `npm run hedera:deploy`      | Deploy contracts to Hedera testnet |

---

## 🤖 Roadmap for Engineers

1. **HashConnect Auth Flow** – Finish pairing UX, store backend-issued JWT, disable dev bypass.
2. **Escrow Enhancements** – In-app creation wizard, bank/stablecoin funding flows, statement uploads.
3. **Document/KYC AI Integration** – Connect real provider APIs (KYC, OCR, sanctions) and surface status in case tabs.
4. **Automated Tests & CI** – Add backend unit/integration tests, frontend component/E2E tests (Vitest/Playwright), wire GitHub Actions.
5. **Deployment Runbook** – Containerise backend/frontend, configure Terraform modules for Postgres/Redis/S3/Hedera secrets.

---

## 🤝 Contributing

1. Fork or clone the repository.
2. Create a feature branch: `git checkout -b feature/my-improvement`.
3. Commit with descriptive messages and add tests/docs where relevant.
4. Open a pull request; include screenshots for UI changes and describe Hedera impacts if any.

We welcome developers, designers, conveyancers, and compliance experts to shape the platform.

---

## 📄 License

**MIT License © 2025 EquiXToken Capital.**  
Commercial use, white-label licensing, and strategic partnerships: contact the EquiXToken Capital team.

---

> “EquiXToken Capital is breaking the barriers of property ownership—turning real estate into programmable, inclusive, and liquid assets for the African continent and beyond.” 🏡✨
