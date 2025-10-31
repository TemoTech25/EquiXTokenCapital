# Vector Database Setup Notes

Use this file to document the collections/indexes you create for the AI agents. Fill in each section as you provision the service and iterate on schema design.

## 1. Provider & Project
- **Provider:** (e.g., Pinecone, Weaviate Cloud, Qdrant Cloud, pgvector)
- **Project/Environment Name:** eqx-rag-dev
- **API Endpoint/Host:** https://...
- **API Key Reference:** stored in vault as `VectorDB/Dev/APIKey`

## 2. Index / Collection Definitions
| Name | Purpose | Dimension | Metric | Replicas | Notes |
|------|---------|-----------|--------|----------|-------|
| clauses | OTP clause embeddings | 768 | cosine | 1 | ingest legal clauses + summaries |
| policy_rules | Compliance policy chunks | 768 | cosine | 1 | used by KYC Agent for rationale |
| documents | Deeds pack templates | 768 | cosine | 1 | used by Document Agent checklist |

Adjust column values to match provider requirements (e.g., metric types).

## 3. Namespaces / Metadata
- **Namespaces:** (e.g., `dev`, `test`, `prod`) to separate environments.
- **Metadata schema:**  
  - `source_type` (enum: otp_template, regulation, policy, checklist)  
  - `source_id` (string, reference to document ID)  
  - `version` (string, semantic version)  
  - `created_at` (ISO timestamp)  
  - `tags` (array of strings for quick filters)

## 4. Ingestion Pipeline
1. Prepare source documents (PDF, DOCX) → convert to text.  
2. Chunk content (target 300–500 tokens) with overlap (50 tokens).  
3. Generate embeddings (e.g., OpenAI text-embedding-3-small, locally hosted model).  
4. Upsert into vector DB with metadata + namespace.  
5. Log ingestion job ID and summary here (date, document names).

## 5. Access Controls
- Restrict API key to read/write within dev environment only.  
- Rotate API key quarterly or on suspected compromise.  
- Document ACLs for future team members.

## 6. Evaluation
- Track embedding model version.  
- Store benchmark results: retrieval precision/recall for sample queries.  
- Note any issues (e.g., noisy embeddings, long response times) and mitigation steps.
