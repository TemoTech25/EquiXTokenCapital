CREATE TABLE ownership_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  percentage NUMERIC(7,4) NOT NULL CHECK (percentage > 0),
  rights_type VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  history_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT fk_ownership_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ownership_asset_id ON ownership_records (asset_id);
CREATE INDEX idx_ownership_owner_id ON ownership_records (owner_id);
CREATE UNIQUE INDEX uq_ownership_asset_owner_rights ON ownership_records (asset_id, owner_id, rights_type);
