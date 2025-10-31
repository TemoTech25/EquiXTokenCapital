# Infrastructure Setup Playbook (Phase 0 Task 3)

Use this checklist to provision the development and testing environments required for the EquiXToken Capital MVP. Follow the steps in order and record credentials securely (password manager or encrypted vault).

---

## 1. Hedera Accounts (Testnet & Previewnet)
1. **Create Hedera portal login:**  
   - Visit https://portal.hedera.com/ and sign up with a work email.  
   - Enable MFA for the account.
2. **Generate testnet account:**  
   - In the portal, request a new *testnet* account; note the account ID (`0.0.x`).  
   - Download the private key JSON file; store in password manager.  
   - Record the key ID and alias in `docs/secrets/hedera.md` (no private keys, only references).
3. **Generate previewnet account (optional but recommended):**  
   - Repeat the process for previewnet to test pre-release features.  
   - Capture the credentials the same way.
4. **Fund the accounts:**  
   - Use the portal faucet to top up HBAR for smart contract deployment on testnet.  
   - Log the funding transaction IDs.
5. **Create operator keypair for automation:**  
   - Use Hedera CLI or SDK script to create an operator key for CI/CD scripts.  
   - Store private key in secrets manager; add `.env.example` entry (`HEDERA_OPERATOR_KEY`).

---

## 2. PostgreSQL Development Database
1. **Choose hosting:** local Docker container or managed service (e.g., Supabase/Hobby AWS RDS).  
2. **Local option:**  
   - Install Docker Desktop.  
   - Run `docker run --name eqx-postgres -e POSTGRES_PASSWORD=<secure> -p 5432:5432 -d postgres:15`.  
   - Create database `eqx_dev` and user `eqx_app` with limited privileges.  
3. **Managed option:**  
   - Provision instance; restrict network access to your IP.  
   - Create separate `dev` and `test` databases.  
4. **Document connection URLs:**  
   - Add placeholders to `.env.example` (`DATABASE_URL`, `TEST_DATABASE_URL`).  
   - Store real credentials in secrets manager.

---

## 3. Object Storage (Documents & Encrypted Files)
1. **AWS S3 (recommended start):**  
   - Create AWS account with MFA.  
   - Set up an S3 bucket `eqx-documents-dev`. Enable bucket versioning and default encryption (SSE-S3).  
   - Create IAM user `eqx-storage-dev` with access policy restricted to the bucket.  
   - Generate access key/secret; store in password manager.  
   - Add `.env.example` entries (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`).
2. **IPFS (for future mainnet anchoring):**  
   - Set up account with Pinata or Web3.Storage.  
   - Obtain API key and secret; store securely.  
   - Note access instructions in `docs/secrets/storage.md` (no sensitive data).

---

## 4. Vector Database (AI Agent RAG)
1. **Select provider:** Start with managed option like Pinecone, Weaviate Cloud, or use open-source (pgvector).  
2. **Provision dev index:**  
   - Create a project named `eqx-rag-dev`; set dimensions (e.g., 768 for BERT-based embeddings).  
   - Obtain API key; store in secrets manager.  
   - Add placeholder env vars (`VECTOR_DB_API_KEY`, `VECTOR_DB_HOST`).  
3. **Set up schema doc:**  
   - Create `docs/ai/vector_schema.md` to record collection/index definitions as you build them.

---

## 5. Secrets & Access Documentation
1. **Create `/docs/secrets/README.md`:**  
   - Outline where secrets are stored (e.g., 1Password vault name, access policy).  
   - Document rotation policy (quarterly or on role change).  
2. **Add `.env.example` at repo root:**  
   - List all required environment variables with dummy values and brief comments.  
   - Ensure `.gitignore` already excludes `.env`.

---

## 6. Infrastructure Validation Checklist
- [ ] Hedera testnet account ID recorded and funded.  
- [ ] Postgres dev/test databases reachable; credentials tested.  
- [ ] S3 bucket accessible with restricted IAM user; test upload/download executed.  
- [ ] Vector DB API key works; test index creation via CLI or SDK.  
- [ ] `.env.example` populated; actual secrets stored securely.  
- [ ] Documentation updated (`docs/secrets/`, this playbook marked with completion date).

Record completion dates for each item in `docs/secrets/infrastructure_log.md` (create file if missing). Update this file whenever infrastructure changes.
