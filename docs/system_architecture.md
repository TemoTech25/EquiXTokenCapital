# EquiXToken Capital System Architecture

This document describes the end-to-end architecture in accessible terms, detailing components, data flows, and deployment considerations required for the MVP.

---

## 1. Architecture Overview
- **Experience Layer:** Web portal (Next.js) for buyers, sellers, intermediaries, municipal users, and investors.
- **Application Services Layer:** Node.js/TypeScript microservices handling workflow orchestration, compliance, payments, notifications.
- **Blockchain Layer (Hedera):** HTS for tokens (NFT title twin, FT fractions), HCS for immutable logs, Smart Contract Service (SCS) for escrow, HFS for document hashes.
- **AI & Automation Layer:** KYC Agent, Document Agent, Orchestrator leveraging OCR, vector DB, policy rules.
- **Data Layer:** PostgreSQL (metadata), S3/IPFS (encrypted documents), Redis (caching), Vector DB (RAG embeddings), analytics warehouse (Redshift/BigQuery or equivalent).
- **Integration Layer:** APIs for KYC vendors, stablecoin/bank rails, municipal systems (API/RPA), notification services (email/SMS), HashPack wallet connector.

---

## 2. Component Breakdown
1. **Web Portal (Next.js)**
   - Responsive dashboards, task lists, audit view, investor portal.
   - Integrates with HashPack (browser extension) and custodial wallet UI.
   - Uses OAuth2/OIDC for user authentication and role-based access.
2. **Gateway & API Layer**
   - GraphQL or REST gateway (e.g., Apollo/Express) managing authentication, rate limits, logging.
   - Communicates with backend services via internal APIs or message bus (Kafka/NATS).
3. **Case & Workflow Service**
   - Stores case states, tasks, SLAs in PostgreSQL.
   - Publishes events to event bus; subscribes to AI decisions, municipal status updates.
4. **Document Vault Service**
   - Handles encrypted storage in S3/IPFS, maintains hash pointers, versioning.
   - Logs document hash to HCS for tamper-evidence.
5. **Compliance Policy Engine**
   - Rule engine (e.g., Open Policy Agent or custom) evaluating KYC/KYB, AML, sanctions rules.
   - Provides human-readable rationale and triggers escalations.
6. **AI Services**
   - **KYC Agent:** Processes OCR, liveness verification results, sanctions data; outputs Pass/Review/Fail.
   - **Document Agent:** Validates OTP clauses, identifies missing annexures, ensures e-sign completeness.
   - **Orchestrator:** Monitors dependencies, triggers nudges, compiles status updates for stakeholders.
   - All AI outputs stored with metadata and logged to HCS.
7. **Escrow & Tokenization Services**
   - Smart contract interface service bridging Node backend with Hedera SCS/HTS.
   - Manages NFT title twin updates, FT issuance, whitelist/holding limit enforcement.
   - Handles escrow deployments, condition checks, payout splits.
8. **Payments Service**
   - Connects to stablecoin custodial provider (API) and bank EFT rails.
   - Reconciliation module produces statements, flags discrepancies.
9. **Notification & Communication**
   - Email/SMS providers (SendGrid/Twilio) for OTP codes, status updates, reminders.
   - In-app notifications via WebSockets or push.
10. **Analytics & Guardian Dashboard**
    - ETL pipeline from PostgreSQL + HCS events into analytics warehouse.
    - Guardian dashboard built on BI tool visualizing ESG metrics and compliance data.

---

## 3. Data Flow (Happy Path)
1. User logs into portal → Gateway authenticates → Case service creates/updates workflow.
2. OTP uploaded → Document Vault encrypts and stores file → Hash recorded on HCS.
3. AI Document Agent checks clauses → Results sent to case service → Notifications issued.
4. Parties complete e-sign → HCS logs signature hash → Case advances to KYC.
5. KYC Agent processes documents via vendor API → Policy engine decides → Decision logged and visible in portal.
6. Escrow created → Backend calls smart contract on Hedera SCS → Conditions set (certificates, payments).
7. Municipal certificates requested → Workflow tracks statuses → Evidence stored and hashed to HCS.
8. Registration confirmed → NFT title twin ownership updated via HTS → Settlement statements generated.
9. Fractional issuance (if applicable) → FT minted, investors whitelisted → Guardian dashboard receives impact metrics.
10. All events streamed to analytics warehouse for reporting and compliance audits.

---

## 4. Security & Compliance Controls
- **Access Management:** RBAC with fine-grained permissions per role (buyer, seller, conveyancer, municipal, investor).
- **Data Protection:** PII encrypted using AES-256 at rest; TLS 1.2+ in transit; key management via KMS.
- **Audit Logging:** Every critical action (KYC decisions, document uploads, escrow events) logged to HCS and internal audit log.
- **Compliance Layer:** Policy engine enforces POPIA/GDPR data minimization, AML checks, travel-rule metadata.
- **Smart Contract Safeguards:** Time-locked administrative controls, emergency pause, multi-sig for critical operations, pre-deployment audits.
- **Monitoring:** Centralized logging (ELK/Datadog), anomaly detection alerts, security incident response runbooks.

---

## 5. Deployment Topology
- **Environment Separation:** Dev, Staging, Production with isolated Hedera accounts and data stores.
- **Infrastructure:** Containerized services (Docker) orchestrated via Kubernetes or managed services (e.g., AWS ECS/EKS).
- **CI/CD Pipeline:** Git-based workflows triggering build/test/deploy per environment with automated linting, unit/integration tests, smart contract deployment scripts.
- **Secrets Management:** Use AWS Secrets Manager/HashiCorp Vault; no plaintext secrets in repositories.
- **Resilience:** Multi-zone deployments, automatic restarts, health checks, nightly backups of databases and document storage indexes.

---

## 6. Integration Points
- **KYC Vendor:** REST APIs for identity verification, integrates via compliance service; results stored with trace IDs.
- **Payments:** Stablecoin API (on-chain transaction triggers) and bank EFT (file-based or API). Reconciliation service cross-checks ledger vs statements.
- **Wallets:** HashPack integration (deep link, QR), custodial wallets for underbanked users managed by backend with 2FA.
- **Municipal Systems:** Use direct APIs where available; fallback RPA scripts/guide uploads with manual confirmation loops.
- **Notifications:** OTP via SMS/email; webhook listeners for status updates (e.g., Hedera mirror node events, KYC vendor callbacks).

---

## 7. Data Model Highlights
- **Case:** Unique ID, parties, property info, current stage, SLA timers, assigned roles.
- **Document:** Metadata (type, owner, version), storage location, hash, HCS transaction ID.
- **KYC Record:** Applicant data, check statuses, policy outcomes, AI rationale, audit references.
- **Escrow:** Contract address, conditions, balances, payout map, status timeline.
- **Token:** NFT metadata (title ID, owner, property attributes), FT issuance parameters, whitelist list.
- **Guardian Metrics:** Project ID, ESG indicators, update frequency, source verification.

---

## 8. Observability & Analytics
- **Event Bus:** Central stream (Kafka/NATS) capturing workflow events for downstream analytics and AI retraining.
- **Dashboards:** Ops dashboard (case progress, SLA), Compliance dashboard (policy overrides, suspicious activity), Guardian dashboard (impact metrics), Engineering dashboard (system health).
- **Logging:** Structured logs with correlation IDs; trace propagation across services (OpenTelemetry).
- **Alerting:** Threshold-based (SLA breaches), anomaly detection (AI performance drops), security alerts (suspicious logins).

---

## 9. Testing Strategy
- **Unit Tests:** Services, policy rules, smart contract functions.
- **Integration Tests:** End-to-end case flow, KYC vendor sandbox, escrow deployment on Hedera testnet.
- **AI Evaluation:** Confusion matrices for KYC/Document Agents, bias checks, continuous evaluation pipeline.
- **Performance Tests:** Simulate ≥10 concurrent cases; ensure <2s API response times on key flows.
- **User Acceptance Tests:** Pilot users execute scripted scenarios before production launch.

---

## 10. Future Scalability Considerations
- **Multi-Tenancy:** Tenant isolation in database schemas and configuration for international expansion.
- **Secondary Market Integration:** API endpoints for compliant secondary trades, real-time compliance checks.
- **Mobile Experience:** PWA optimizations or native wrapper apps for low-bandwidth environments.
- **Advanced AI:** Real-time orchestration assistant, predictive completion timelines, conversation interface.
- **Ecosystem APIs:** Partner APIs for third-party developers to embed transfer workflow into their systems securely.

---

## 11. Architecture Governance Checklist (Founder)
1. Approve architecture diagram updates each phase.
2. Validate compliance impact assessments before new integrations.
3. Ensure data residency requirements met for each geography.
4. Review incident reports and remediation summaries monthly.
5. Confirm documentation (runbooks, ADRs, diagrams) stays current at every release.
