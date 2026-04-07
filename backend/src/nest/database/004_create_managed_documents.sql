CREATE TABLE managed_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(120) NOT NULL,
  owner_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_managed_documents_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_managed_documents_owner_type_version
  ON managed_documents (owner_id, type, version);

CREATE INDEX idx_managed_documents_owner_id ON managed_documents (owner_id);
