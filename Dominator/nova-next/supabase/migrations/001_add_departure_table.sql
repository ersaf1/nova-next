-- ============================================================
-- NOVA Migration: Add PackageDeparture table
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create PackageDeparture table
CREATE TABLE IF NOT EXISTS "PackageDeparture" (
  "id"             BIGSERIAL PRIMARY KEY,
  "packageId"      BIGINT NOT NULL REFERENCES "Package"("id") ON DELETE CASCADE,
  "startDate"      DATE NOT NULL,
  "endDate"        DATE NOT NULL,
  "capacity"       INTEGER NOT NULL DEFAULT 20,
  "remainingSlots" INTEGER NOT NULL DEFAULT 20,
  "price"          BIGINT NOT NULL,  -- IDR, stored in full rupiah
  "status"         TEXT NOT NULL DEFAULT 'available'
                   CHECK ("status" IN ('available', 'limited', 'sold_out', 'cancelled')),
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by packageId
CREATE INDEX IF NOT EXISTS idx_departure_package ON "PackageDeparture"("packageId");
CREATE INDEX IF NOT EXISTS idx_departure_status ON "PackageDeparture"("status");
CREATE INDEX IF NOT EXISTS idx_departure_start ON "PackageDeparture"("startDate");

-- 2. Update Booking table to support new fields (non-breaking, all nullable)
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "departureId"        BIGINT REFERENCES "PackageDeparture"("id"),
  ADD COLUMN IF NOT EXISTS "departureStartDate" DATE,
  ADD COLUMN IF NOT EXISTS "departureEndDate"   DATE,
  ADD COLUMN IF NOT EXISTS "unitPrice"          BIGINT,
  ADD COLUMN IF NOT EXISTS "subtotal"           BIGINT,
  ADD COLUMN IF NOT EXISTS "discountAmount"     BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalAmount"        BIGINT,
  ADD COLUMN IF NOT EXISTS "bookingCode"        TEXT,
  ADD COLUMN IF NOT EXISTS "bookingStatus"      TEXT NOT NULL DEFAULT 'pending'
                                                CHECK ("bookingStatus" IN ('pending','confirmed','cancelled','completed')),
  ADD COLUMN IF NOT EXISTS "paymentStatus"      TEXT NOT NULL DEFAULT 'unpaid'
                                                CHECK ("paymentStatus" IN ('unpaid','pending','paid','failed','expired','refunded'));

-- 3. Seed some sample departures for existing packages
-- (Run after confirming Package IDs in your database)
-- INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
-- SELECT id, NOW()::date + 14, NOW()::date + 21, 20, 20, price, 'available'
-- FROM "Package" LIMIT 5;

-- 4. Auto-update updatedAt trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER departure_updated_at
  BEFORE UPDATE ON "PackageDeparture"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
