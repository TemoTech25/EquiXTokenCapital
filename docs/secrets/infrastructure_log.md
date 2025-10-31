# Infrastructure Provisioning Log

Record each environment setup activity here without storing actual secrets. Include references to the vault entries and validation notes.

| Date | Environment | Action | Vault Reference | Validation Notes |
|------|-------------|--------|-----------------|------------------|
| YYYY-MM-DD | Hedera Testnet | Account created & funded | `Hedera/Testnet/OperatorKey` | Faucet transfer TX: ... |
| YYYY-MM-DD | AWS S3 | Bucket `eqx-documents-dev` created | `AWS/S3/EqiXDocumentsDev` | Test upload object `ping.txt` succeeded |
| YYYY-MM-DD | PostgreSQL Dev |  |  |  |
| YYYY-MM-DD | PostgreSQL Test |  |  |  |
| YYYY-MM-DD | Vector DB |  |  |  |
| YYYY-MM-DD | (Other) |  |  |  |

Update entries as you provision new services or modify existing ones.
