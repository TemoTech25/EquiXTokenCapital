CREATE TYPE payment_currency AS ENUM ('ZAR', 'USD');
CREATE TYPE payment_status AS ENUM ('PENDING', 'HELD', 'RELEASED');
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CARD');

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,
  payer_id UUID NOT NULL,
  amount NUMERIC(16,2) NOT NULL CHECK (amount > 0),
  currency payment_currency NOT NULL,
  status payment_status NOT NULL DEFAULT 'PENDING',
  payment_method payment_method NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_payments_deal FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payments_payer FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL,
  action VARCHAR(120) NOT NULL,
  meta_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_payment_audit_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_deal_id ON payments (deal_id);
CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payment_audit_payment_id ON payment_audit_logs (payment_id);
