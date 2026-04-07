# NestJS Authentication + User + Property/Deal Management

## Features
- JWT authentication
- Role-based access control (RBAC)
- Roles: Admin, Conveyancer, Agent, Buyer, Seller
- Input validation via `class-validator`
- Password hashing using `bcrypt`
- Property creation + retrieval
- Deal creation + retrieval with FK-backed relational integrity
- Transaction workflow engine with finite-state transitions, timestamped state history, and role-assigned tasks
- Private document upload + versioning to AWS S3 with signed URL access
- Ownership registry with percentage consistency enforcement and transfer audit history
- Off-chain tokenization engine with mint/transfer and ownership sync
- Notification system (in-app + email) for state changes and task assignments
- Payment + escrow tracking with automatic release on transfer completion and audit logs
- KYC/AML verification module with document uploads, status tracking, and suspicious-user flagging
- SPV management with share allocation and ownership-registry linkage
- Investment module for SPV opportunities, subscriptions, and investor allocation tracking
- Controlled secondary ownership transfers with approval workflow and KYC compliance checks
- Analytics and reporting module with aggregation-based platform metrics
- AI-assisted automation for document parsing, workflow suggestions, and risk flags
- Hedera blockchain integration with off-chain fallback for token mint/transfer

## Endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me` (JWT required)
- `PATCH /users/:id` (JWT + `Admin` role required)
- `POST /properties`
- `GET /properties/:id`
- `POST /deals`
- `GET /deals/:id`
- `PATCH /transactions/:id/state`
- `GET /transactions/:id`
- `POST /transactions/:id/tasks`
- `POST /documents/upload`
- `GET /documents/:id`
- `POST /ownership`
- `GET /ownership/:asset_id`
- `PATCH /ownership/transfer`
- `POST /tokens/mint`
- `POST /tokens/transfer`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /payments/initiate`
- `GET /payments/:deal_id`
- `PATCH /payments/:id/status`
- `POST /kyc/upload`
- `GET /kyc/status/:user_id`
- `PATCH /kyc/verify`
- `POST /spv/create`
- `GET /spv/:id`
- `POST /spv/allocate-shares`
- `POST /investments/subscribe`
- `GET /investments/:user_id`
- `GET /investments/opportunities`
- `POST /transfers/request`
- `PATCH /transfers/:id/approve`
- `GET /transfers/:user_id`
- `GET /analytics/overview`
- `GET /analytics/deals`
- `GET /analytics/users`
- `POST /ai/parse-document`
- `GET /ai/suggestions/:deal_id`
- `POST /blockchain/mint`
- `POST /blockchain/transfer`
- `GET /blockchain/:asset_id`

## Required environment variables
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional, defaults to `1d`)
- `PORT` (optional, defaults to `3000`)
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `TOKEN_SUPPLY_DEFAULT` (optional, defaults to `1000000`)
- `SENDGRID_API_KEY` (optional, enables email notifications)
- `SENDGRID_FROM_EMAIL` (optional, defaults to `no-reply@equix.local`)
- `SMILE_IDENTITY_ENDPOINT` (optional, external KYC API endpoint)
- `SMILE_IDENTITY_API_KEY` (optional, external KYC API key)
- `OPENAI_API_KEY` (optional, enables AI parsing via OpenAI)
- `HEDERA_NETWORK` (optional, `testnet` by default)
- `HEDERA_OPERATOR_ID` (optional, enables on-chain execution)
- `HEDERA_OPERATOR_KEY` (optional, enables on-chain execution)

## Run
1. Add dependencies (if not already installed):
   - `@nestjs/common`, `@nestjs/core`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`
   - `@nestjs/typeorm`, `typeorm`, `pg`, `passport-jwt`, `class-validator`, `class-transformer`, `bcrypt`
2. Run SQL migrations in `database/001_create_users.sql`, `database/002_create_properties_and_deals.sql`, `database/003_create_transactions.sql`, `database/004_create_managed_documents.sql`, `database/005_create_ownership_records.sql`, `database/006_create_offchain_tokens.sql`, `database/007_create_notifications.sql`, `database/008_create_payments_and_audit_logs.sql`, `database/009_create_kyc_records.sql`, `database/010_create_spvs.sql`, `database/011_create_investments.sql`, `database/012_create_ownership_transfers.sql`, and `database/013_create_blockchain_tokens.sql`.
3. Start from `src/nest/main.ts`.


## Compliance note
- The KYC flow is structured for FICA-aligned onboarding: ID/passport capture, verification status tracking, suspicious-flag handling, and audit-friendly timestamps.
