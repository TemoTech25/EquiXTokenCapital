# PostgreSQL Setup Guide

Follow this guide to create local development and test databases. Adjust commands if you choose a managed provider instead of Docker.

---

## 1. Local Docker Container (Recommended Start)
```bash
# pull the latest postgres image
docker pull postgres:15

# run container in the background
docker run --name eqx-postgres \
  -e POSTGRES_PASSWORD=replace-with-strong-password \
  -p 5432:5432 \
  -d postgres:15
```

## 2. Create Databases & Users
```bash
# access the container shell
docker exec -it eqx-postgres psql -U postgres

-- inside psql
CREATE DATABASE eqx_dev;
CREATE DATABASE eqx_test;

CREATE USER eqx_app WITH ENCRYPTED PASSWORD 'replace-with-strong-password';
GRANT ALL PRIVILEGES ON DATABASE eqx_dev TO eqx_app;
GRANT ALL PRIVILEGES ON DATABASE eqx_test TO eqx_app;
```

## 3. Apply Extensions (Optional)
If using `pgvector` for embeddings:
```sql
\c eqx_dev
CREATE EXTENSION IF NOT EXISTS vector;

\c eqx_test
CREATE EXTENSION IF NOT EXISTS vector;
```

## 4. Update Environment Variables
- Set `DATABASE_URL` and `TEST_DATABASE_URL` in your local `.env` using the credentials above.
- Never commit the real `.env` file; use `.env.example` as a reference for teammates.

## 5. Stop/Start Commands
```bash
docker stop eqx-postgres
docker start eqx-postgres
```

## 6. Backup & Restore (When Needed)
```bash
# backup
pg_dump -U eqx_app -h localhost -d eqx_dev > backups/eqx_dev_$(date +%Y%m%d).sql

# restore
psql -U eqx_app -h localhost -d eqx_dev < backups/eqx_dev_latest.sql
```

Record completion in `docs/secrets/infrastructure_log.md` with the date and validation notes.
