-- V5: Restaurant Tables and Table Occupancy Management for Mahalaxmi POS

CREATE TABLE IF NOT EXISTS restaurant_tables (
    id            BIGSERIAL PRIMARY KEY,
    table_name    VARCHAR(50)  NOT NULL UNIQUE,
    capacity      INT          NOT NULL DEFAULT 4 CHECK (capacity > 0),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order INT          NOT NULL DEFAULT 0,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_active_order ON restaurant_tables(active, display_order);

-- Seed initial tables matching existing standard restaurant floor layout
INSERT INTO restaurant_tables (table_name, capacity, active, display_order) VALUES
    ('Table 1', 4, TRUE, 1),
    ('Table 2', 4, TRUE, 2),
    ('Table 3', 4, TRUE, 3),
    ('Table 4', 4, TRUE, 4),
    ('Table 5', 4, TRUE, 5),
    ('Table 6', 4, TRUE, 6),
    ('Table 7', 6, TRUE, 7),
    ('Table 8', 6, TRUE, 8),
    ('Family Hall 1', 10, TRUE, 9),
    ('Family Hall 2', 12, TRUE, 10)
ON CONFLICT (table_name) DO NOTHING;

-- Enforce zero conflicting active dine-in orders on the same table concurrently
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_active_dine_in_table 
ON orders (LOWER(TRIM(table_number))) 
WHERE order_type = 'DINE_IN' AND status = 'OPEN';
