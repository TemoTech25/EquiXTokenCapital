CREATE TYPE kyc_document_type AS ENUM ('ID', 'PASSPORT');
CREATE TYPE kyc_verification_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type kyc_document_type NOT NULL,
  document_url TEXT NOT NULL,
  verification_status kyc_verification_status NOT NULL DEFAULT 'PENDING',
  suspicious_flag BOOLEAN NOT NULL DEFAULT FALSE,
  suspicious_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_kyc_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_kyc_user_id ON kyc_records (user_id);
CREATE INDEX idx_kyc_status ON kyc_records (verification_status);
CREATE INDEX idx_kyc_suspicious_flag ON kyc_records (suspicious_flag);
