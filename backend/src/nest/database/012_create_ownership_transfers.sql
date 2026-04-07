CREATE TYPE ownership_transfer_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE ownership_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  percentage NUMERIC(7,4) NOT NULL CHECK (percentage > 0),
  status ownership_transfer_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_transfer_from_user FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_transfer_to_user FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_ownership_transfers_from_user ON ownership_transfers (from_user_id);
CREATE INDEX idx_ownership_transfers_to_user ON ownership_transfers (to_user_id);
CREATE INDEX idx_ownership_transfers_asset_id ON ownership_transfers (asset_id);
CREATE INDEX idx_ownership_transfers_status ON ownership_transfers (status);
