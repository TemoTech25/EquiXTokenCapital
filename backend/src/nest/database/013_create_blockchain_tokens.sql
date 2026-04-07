CREATE TABLE blockchain_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  hedera_token_id VARCHAR(100),
  transaction_hash VARCHAR(150),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_blockchain_tokens_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_blockchain_tokens_asset_id ON blockchain_tokens (asset_id);
CREATE INDEX idx_blockchain_tokens_owner_id ON blockchain_tokens (owner_id);
CREATE INDEX idx_blockchain_tokens_hedera_token_id ON blockchain_tokens (hedera_token_id);
