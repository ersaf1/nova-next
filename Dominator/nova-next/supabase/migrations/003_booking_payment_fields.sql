-- Add Midtrans tracking fields to Booking
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "midtrans_transaction_id" TEXT,
  ADD COLUMN IF NOT EXISTS "midtrans_payment_method" TEXT,
  ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMPTZ;

-- Fix bookingStatus CHECK constraint to include 'pending_payment' and 'draft'
-- Original 001 migration only had: 'pending','confirmed','cancelled','completed'
ALTER TABLE "Booking"
  DROP CONSTRAINT IF EXISTS "Booking_bookingStatus_check";

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_bookingStatus_check"
  CHECK ("bookingStatus" IN ('draft','pending','pending_payment','confirmed','cancelled','completed'));
