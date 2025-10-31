# Vector Database Provisioning Guide

Follow these steps to spin up a managed vector database (example: Pinecone). Adapt commands if you choose another provider (Weaviate Cloud, Qdrant Cloud, pgvector).

---

## 1. Create Account & Project
1. Sign up at https://www.pinecone.io/ (or chosen provider) with work email; enable MFA.
2. Create project `eqx-rag-dev` in the closest region to reduce latency (e.g., `us-east-1`).
3. Generate an API key with **write** access for development; copy once and store in password manager (`VectorDB/Dev/APIKey`).
4. Add read-only key for future staging usage (optional).

---

## 2. Create Indexes
Use the provider dashboard or CLI/SDK to create indexes.

**Example (Pinecone CLI):**
```bash
pip install pinecone-client

pinecone configure --api-key <your-api-key> --environment <environment>

pinecone create-index clauses \
  --dimension 768 \
  --metric cosine \
  --pods 1 \
  --replicas 1 \
  --pod-type p1.x1 \
  --metadata-config '{"indexed":["source_type","source_id","version","tags"]}'
```

Repeat for `policy_rules` and `documents` indexes (or use namespaces if your provider prefers a single index with metadata namespaces).

Document each index in `docs/ai/vector_schema.md`.

---

## 3. Test Connectivity
Run a quick smoke test to ensure the index accepts writes and reads.

```python
from pinecone import Pinecone, ServerlessSpec
import os

pc = Pinecone(api_key=os.environ["VECTOR_DB_API_KEY"])
index = pc.Index("clauses")

index.upsert(vectors=[
    {
        "id": "test-1",
        "values": [0.1] * 768,
        "metadata": {"source_type": "otp_template", "source_id": "sample", "version": "0.1.0"}
    }
])

print(index.query(vector=[0.1] * 768, top_k=1))
```

Verify the response includes the test vector, then delete it.

---

## 4. Update Environment Variables
- Add `VECTOR_DB_API_KEY`, `VECTOR_DB_HOST`, and `VECTOR_DB_INDEX` (if single-index approach) to your local `.env`.  
- Keep `.env.example` updated with placeholder values.

---

## 5. Logging & Validation
- Record setup in `docs/secrets/infrastructure_log.md` with date, index names, and validation summary.
- Note ingestion or access scripts in `docs/ai/` as they are created.

---

## 6. Cleanup & Cost Control
- Enable auto-scaling or serverless mode if available.
- Set reminders to clean unused indexes monthly.
- Monitor usage dashboard; set budget alerts if provider supports it.
