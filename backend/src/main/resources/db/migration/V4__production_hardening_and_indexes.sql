-- V4: Production Hardening, Performance Indexes, and Integrity Safeguards
-- Mahalaxmi Hotel POS

-- 1. Index on bills for fast date-range and reporting lookups
CREATE INDEX IF NOT EXISTS idx_bills_paid_at_status ON bills(paid_at, status);
CREATE INDEX IF NOT EXISTS idx_bills_status_paid_at ON bills(status, paid_at);

-- 2. Index on order items for fast sales analytics & menu item lookups
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- 3. Composite index on orders for open/cancelled count and date filters
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

-- 4. Index on payments for bill payment auditing
CREATE INDEX IF NOT EXISTS idx_payments_bill_id_status ON payments(bill_id, status);

-- 5. Composite index on menu items for category-wise active item listing
CREATE INDEX IF NOT EXISTS idx_menu_items_cat_avail ON menu_items(category_id, available);
