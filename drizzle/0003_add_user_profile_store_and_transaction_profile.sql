-- Add store reference to user profiles and connect transactions to customer profiles.

ALTER TABLE user_profiles
  ADD COLUMN store_id uuid REFERENCES stores(id);

ALTER TABLE user_profiles
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE user_profiles
  ADD COLUMN created_at timestamp DEFAULT NOW();

ALTER TABLE transactions
  ADD COLUMN user_profile_id uuid REFERENCES user_profiles(id);

UPDATE transactions
  SET payment_method = 'QRIS'
  WHERE payment_method IS NULL;

ALTER TABLE transactions
  ALTER COLUMN payment_method SET NOT NULL;

ALTER TABLE transactions
  ALTER COLUMN payment_method SET DEFAULT 'QRIS';
