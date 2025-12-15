-- Add shares column to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS shares INTEGER DEFAULT 0;

-- Update existing rows to have 0 shares
UPDATE subscriptions SET shares = 0 WHERE shares IS NULL;
