/*
# Add pricing columns to store_settings and orders

## Summary
Adds dynamic pricing configuration columns to `store_settings` (package prices + RGH unlock fee)
and a `total_price` column to `orders` to persist the calculated order total.

## 1. store_settings: new pricing columns
- price_package_1 numeric(10,2) DEFAULT 120.00 — up to 15 games
- price_package_2 numeric(10,2) DEFAULT 150.00 — up to 25 games
- price_package_3 numeric(10,2) DEFAULT 180.00 — up to 30 games
- price_unlock_rgh numeric(10,2) DEFAULT 5.00 — RGH unlock fee

## 2. orders: new column
- total_price numeric(10,2) — the total calculated at checkout (games package + unlock fee)
  Stored as a snapshot of the price at order time. Nullable for backwards compatibility.
*/
ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS price_package_1 numeric(10,2) NOT NULL DEFAULT 120.00,
  ADD COLUMN IF NOT EXISTS price_package_2 numeric(10,2) NOT NULL DEFAULT 150.00,
  ADD COLUMN IF NOT EXISTS price_package_3 numeric(10,2) NOT NULL DEFAULT 180.00,
  ADD COLUMN IF NOT EXISTS price_unlock_rgh numeric(10,2) NOT NULL DEFAULT 5.00;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS total_price numeric(10,2);
