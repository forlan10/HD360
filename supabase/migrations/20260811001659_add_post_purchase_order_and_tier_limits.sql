ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS post_purchase_order text NOT NULL DEFAULT 'upsell_first',
  ADD COLUMN IF NOT EXISTS tier_1_max integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS tier_2_max integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS tier_3_max integer NOT NULL DEFAULT 30;