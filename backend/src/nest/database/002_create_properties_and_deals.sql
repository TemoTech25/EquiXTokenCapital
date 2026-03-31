CREATE TYPE deal_status AS ENUM ('Draft', 'InReview', 'Active', 'Completed', 'Cancelled');

CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  valuation NUMERIC(14,2) NOT NULL CHECK (valuation > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  agent_id UUID NOT NULL,
  conveyancer_id UUID NOT NULL,
  status deal_status NOT NULL DEFAULT 'Draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_deals_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_agent FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_deals_conveyancer FOREIGN KEY (conveyancer_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_deals_property_id ON deals (property_id);
CREATE INDEX idx_deals_buyer_id ON deals (buyer_id);
CREATE INDEX idx_deals_seller_id ON deals (seller_id);
CREATE INDEX idx_deals_agent_id ON deals (agent_id);
CREATE INDEX idx_deals_conveyancer_id ON deals (conveyancer_id);
CREATE INDEX idx_deals_status ON deals (status);
