# Secrets Storage Overview

All sensitive credentials are stored outside the repository. Use this file to record where secrets live and how to access them. Never commit real keys or passwords.

## Vault
- **Name:** (fill in your password manager or vault name)
- **Owners:** (list who has access; update when team members join/leave)
- **Access Policy:** MFA required; approvals logged in founder decision register.

## Stored Secrets
| Service | Secret Name in Vault | Notes |
|---------|---------------------|-------|
| Hedera Testnet | `Hedera/Testnet/OperatorKey` | Private key JSON; rotate every 90 days. |
| AWS S3 | `AWS/S3/EqiXDocumentsDev` | Access key + secret; restrict IAM to required actions. |
| PostgreSQL Dev | `Postgres/Dev/AppUser` | Fill after database creation. |
| PostgreSQL Test | `Postgres/Test/AppUser` | Fill after database creation. |
| Vector DB | `VectorDB/Dev/APIKey` | Fill after provisioning. |
| (Add others) |  |  |

## Rotation Log
- YYYY-MM-DD — (service) secret rotated by (owner); old keys revoked.

Update this file whenever a new secret is added, rotated, or revoked.
