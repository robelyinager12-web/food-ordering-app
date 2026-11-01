ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(10) NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS tx_ref VARCHAR(60) UNIQUE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
