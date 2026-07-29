-- Add refund fields to Booking table
ALTER TABLE "Booking" 
  ADD COLUMN IF NOT EXISTS refund_status text DEFAULT 'none' CHECK (refund_status IN ('none', 'requested', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS refund_reason text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;

COMMENT ON COLUMN "Booking".refund_status IS 'Refund state: none|requested|approved|rejected';
