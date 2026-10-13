-- V2: Menu Categories, Menu Items, Orders, and Order Items for Mahalaxmi POS
-- Includes initial seed data for Mahalaxmi Hotel, Ispurli

CREATE TABLE IF NOT EXISTS menu_categories (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL UNIQUE,
    display_order INT          NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_active_order ON menu_categories(active, display_order);

CREATE TABLE IF NOT EXISTS menu_items (
    id            BIGSERIAL PRIMARY KEY,
    category_id   BIGINT         NOT NULL REFERENCES menu_categories(id),
    name          VARCHAR(150)   NOT NULL,
    price         NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_veg        BOOLEAN        NOT NULL DEFAULT TRUE,
    available     BOOLEAN        NOT NULL DEFAULT TRUE,
    display_order INT            NOT NULL DEFAULT 0,
    created_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_menu_item_category_name UNIQUE (category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

CREATE TABLE IF NOT EXISTS orders (
    id           BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(40)    NOT NULL UNIQUE,
    table_number VARCHAR(30),
    order_type   VARCHAR(20)    NOT NULL DEFAULT 'DINE_IN',
    status       VARCHAR(30)    NOT NULL DEFAULT 'OPEN',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes         VARCHAR(500),
    created_by   BIGINT         REFERENCES users(id),
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT         NOT NULL REFERENCES menu_items(id),
    item_name    VARCHAR(150)   NOT NULL,
    unit_price   NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity     INT            NOT NULL CHECK (quantity > 0),
    subtotal     NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    status       VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    created_at   TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================
-- Seed Initial Categories for Mahalaxmi Hotel
-- ============================================================
INSERT INTO menu_categories (name, display_order, active) VALUES
    ('Thali', 1, TRUE),
    ('Chicken', 2, TRUE),
    ('Mutton', 3, TRUE),
    ('Veg Main Course', 4, TRUE),
    ('Roti & Rice', 5, TRUE),
    ('Beverages & Extras', 6, TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- Seed Initial Menu Items for Mahalaxmi Hotel
-- ============================================================
INSERT INTO menu_items (category_id, name, price, is_veg, available, display_order)
SELECT c.id, v.name, v.price, v.is_veg, TRUE, v.display_order
FROM (
    VALUES
        ('Thali', 'Special Mahalaxmi Thali', 350.00, FALSE, 1),
        ('Thali', 'Special Veg Thali', 170.00, TRUE, 2),
        ('Thali', 'Special Mutton Thali', 380.00, FALSE, 3),
        ('Thali', 'Special Chicken Thali', 260.00, FALSE, 4),
        ('Thali', 'Egg Thali', 190.00, FALSE, 5),

        ('Chicken', 'Chicken Fry', 200.00, FALSE, 1),
        ('Chicken', 'Chicken Masala', 200.00, FALSE, 2),
        ('Chicken', 'Butter Chicken', 240.00, FALSE, 3),
        ('Chicken', 'Chicken Sukka', 210.00, FALSE, 4),
        ('Chicken', 'Chicken Handi (Half)', 320.00, FALSE, 5),
        ('Chicken', 'Chicken Handi (Full)', 580.00, FALSE, 6),

        ('Mutton', 'Mutton Masala', 280.00, FALSE, 1),
        ('Mutton', 'Mutton Fry', 280.00, FALSE, 2),
        ('Mutton', 'Mutton Sukka', 290.00, FALSE, 3),
        ('Mutton', 'Mutton Handi (Half)', 420.00, FALSE, 4),
        ('Mutton', 'Mutton Handi (Full)', 780.00, FALSE, 5),

        ('Veg Main Course', 'Paneer Masala', 180.00, TRUE, 1),
        ('Veg Main Course', 'Paneer Butter Masala', 200.00, TRUE, 2),
        ('Veg Main Course', 'Kaju Curry', 200.00, TRUE, 3),
        ('Veg Main Course', 'Mix Veg', 160.00, TRUE, 4),
        ('Veg Main Course', 'Dal Tadka', 130.00, TRUE, 5),
        ('Veg Main Course', 'Shev Bhaji', 150.00, TRUE, 6),

        ('Roti & Rice', 'Chapati', 15.00, TRUE, 1),
        ('Roti & Rice', 'Jowar Bhakri', 25.00, TRUE, 2),
        ('Roti & Rice', 'Tandoori Roti', 20.00, TRUE, 3),
        ('Roti & Rice', 'Butter Naan', 40.00, TRUE, 4),
        ('Roti & Rice', 'Jeera Rice', 110.00, TRUE, 5),
        ('Roti & Rice', 'Masala Bhat', 140.00, TRUE, 6),
        ('Roti & Rice', 'Indrayani Rice (Plate)', 90.00, TRUE, 7),

        ('Beverages & Extras', 'Solkadhi', 40.00, TRUE, 1),
        ('Beverages & Extras', 'Masala Taak (Buttermilk)', 25.00, TRUE, 2),
        ('Beverages & Extras', 'Mineral Water (1L)', 20.00, TRUE, 3),
        ('Beverages & Extras', 'Roasted Papad', 20.00, TRUE, 4)
) AS v(cat_name, name, price, is_veg, display_order)
JOIN menu_categories c ON c.name = v.cat_name
ON CONFLICT (category_id, name) DO NOTHING;
