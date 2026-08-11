ALTER TABLE store_settings
  ADD COLUMN IF NOT EXISTS whatsapp_button_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS invoice_screen_enabled boolean NOT NULL DEFAULT true;