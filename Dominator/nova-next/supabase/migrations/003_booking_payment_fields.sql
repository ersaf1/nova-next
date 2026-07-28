-- Add Midtrans tracking fields to Booking
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "midtrans_transaction_id" TEXT,
  ADD COLUMN IF NOT EXISTS "midtrans_payment_method" TEXT,
  ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMPTZ;
