CREATE TYPE transaction_state AS ENUM (
  'CREATED',
  'OFFER_MADE',
  'OFFER_ACCEPTED',
  'DOCUMENTS_PENDING',
  'COMPLIANCE_CHECK',
  'TRANSFER_INITIATED',
  'TRANSFER_COMPLETED'
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  current_state transaction_state NOT NULL DEFAULT 'CREATED',
  state_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  CONSTRAINT fk_transactions_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE RESTRICT
);

CREATE INDEX idx_transactions_deal_id ON transactions (deal_id);
CREATE INDEX idx_transactions_current_state ON transactions (current_state);
