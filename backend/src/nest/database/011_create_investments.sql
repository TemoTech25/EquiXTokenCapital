CREATE TYPE investment_status AS ENUM ('PENDING', 'CONFIRMED');

CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spv_id UUID NOT NULL,
  investor_id UUID NOT NULL,
  amount_invested NUMERIC(16,2) NOT NULL CHECK (amount_invested > 0),
  shares_allocated INTEGER NOT NULL CHECK (shares_allocated > 0),
  status investment_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_investments_spv FOREIGN KEY (spv_id) REFERENCES spvs(id) ON DELETE RESTRICT,
  CONSTRAINT fk_investments_investor FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_investments_investor_id ON investments (investor_id);
CREATE INDEX idx_investments_spv_id ON investments (spv_id);
CREATE INDEX idx_investments_status ON investments (status);
