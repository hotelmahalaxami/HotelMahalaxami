-- V3: Billing, Payments, and Invoicing for Mahalaxmi Hotel POS

CREATE TABLE IF NOT EXISTS bills (
    id              BIGSERIAL PRIMARY KEY,
    bill_number     VARCHAR(40)    NOT NULL UNIQUE,
    order_id        BIGINT         NOT NULL UNIQUE REFERENCES orders(id),
    subtotal        NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount      NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    final_amount    NUMERIC(10, 2) NOT NULL CHECK (final_amount >= 0),
    status          VARCHAR(30)    NOT NULL DEFAULT 'UNPAID',
    notes           VARCHAR(500),
    created_by      BIGINT         REFERENCES users(id),
    paid_at         TIMESTAMP,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_order_id ON bills(order_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at DESC);

CREATE TABLE IF NOT EXISTS payments (
    id              BIGSERIAL PRIMARY KEY,
    payment_number  VARCHAR(40)    NOT NULL UNIQUE,
    bill_id         BIGINT         NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    amount          NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method  VARCHAR(20)    NOT NULL,
    transaction_ref VARCHAR(100),
    status          VARCHAR(20)    NOT NULL DEFAULT 'SUCCESS',
    recorded_by     BIGINT         REFERENCES users(id),
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

COMMENT ON TABLE bills IS 'Bills and receipts generated for customer orders';
COMMENT ON TABLE payments IS 'Payment transactions recorded for bills (CASH, UPI, CARD)';
