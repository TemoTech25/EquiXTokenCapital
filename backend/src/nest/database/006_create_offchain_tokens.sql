CREATE TABLE offchain_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  amount NUMERIC(20,4) NOT NULL CHECK (amount >= 0),
  type VARCHAR(80) NOT NULL,
  CONSTRAINT fk_offchain_tokens_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_offchain_tokens_asset_owner_type ON offchain_tokens (asset_id, owner_id, type);
CREATE INDEX idx_offchain_tokens_asset_type ON offchain_tokens (asset_id, type);
