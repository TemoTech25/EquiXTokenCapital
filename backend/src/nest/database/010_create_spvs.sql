CREATE TYPE spv_legal_type AS ENUM ('PTY_LTD', 'TRUST');

CREATE TABLE spvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  property_id UUID NOT NULL,
  legal_type spv_legal_type NOT NULL,
  total_shares INTEGER NOT NULL CHECK (total_shares > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_spv_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT
);

CREATE TABLE spv_share_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  shares INTEGER NOT NULL CHECK (shares > 0),
  CONSTRAINT fk_spv_alloc_spv FOREIGN KEY (spv_id) REFERENCES spvs(id) ON DELETE CASCADE,
  CONSTRAINT fk_spv_alloc_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX uq_spv_alloc_spv_owner ON spv_share_allocations (spv_id, owner_id);
CREATE INDEX idx_spv_property_id ON spvs (property_id);
CREATE INDEX idx_spv_alloc_spv_id ON spv_share_allocations (spv_id);
