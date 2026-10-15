-- V6: Website Orders and Idempotency Support for Hotel Mahalaxmi

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_source VARCHAR(20) NOT NULL DEFAULT 'POS';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS acceptance_status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_notes VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_token VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_tracking_token ON orders(tracking_token);
CREATE INDEX IF NOT EXISTS idx_orders_source_acceptance ON orders(order_source, acceptance_status);

CREATE TABLE IF NOT EXISTS order_idempotency_keys (
    id               BIGSERIAL PRIMARY KEY,
    idempotency_key  VARCHAR(128) NOT NULL UNIQUE,
    order_id         BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    response_payload TEXT NOT NULL,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at       TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_idempotency_expires ON order_idempotency_keys(expires_at);
