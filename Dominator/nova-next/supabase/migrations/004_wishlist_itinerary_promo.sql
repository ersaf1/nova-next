-- ============================================================
-- NOVA Migration 004: Wishlist (packages), SavedItinerary, PromoCode
-- ============================================================

-- 1. Extend Wishlist to support packages
ALTER TABLE "Wishlist"
  ADD COLUMN IF NOT EXISTS "packageId" BIGINT REFERENCES "Package"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'destination'
    CHECK ("type" IN ('destination','package'));

-- 2. SavedItinerary table
CREATE TABLE IF NOT EXISTS "SavedItinerary" (
  "id"               BIGSERIAL PRIMARY KEY,
  "userId"           TEXT NOT NULL,
  "title"            TEXT NOT NULL DEFAULT 'Itinerary Baru',
  "destination"      TEXT NOT NULL,
  "duration"         INTEGER NOT NULL,
  "travelers"        INTEGER NOT NULL DEFAULT 1,
  "budget"           BIGINT,
  "preferences"      TEXT DEFAULT '[]',
  "generatedContent" JSONB,
  "visibility"       TEXT NOT NULL DEFAULT 'private'
    CHECK ("visibility" IN ('private','shared')),
  "shareToken"       TEXT UNIQUE,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itinerary_user ON "SavedItinerary"("userId");
CREATE INDEX IF NOT EXISTS idx_itinerary_token ON "SavedItinerary"("shareToken");

-- 3. PromoCode table
CREATE TABLE IF NOT EXISTS "PromoCode" (
  "id"               BIGSERIAL PRIMARY KEY,
  "code"             TEXT NOT NULL UNIQUE,
  "discountType"     TEXT NOT NULL CHECK ("discountType" IN ('percentage','fixed')),
  "discountValue"    NUMERIC(10,2) NOT NULL,
  "minimumPurchase"  BIGINT,
  "maximumDiscount"  BIGINT,
  "startDate"        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "endDate"          TIMESTAMPTZ NOT NULL,
  "usageLimit"       INTEGER,
  "usagePerUser"     INTEGER DEFAULT 1,
  "usageCount"       INTEGER NOT NULL DEFAULT 0,
  "active"           BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed NOVA15 promo
INSERT INTO "PromoCode" ("code","discountType","discountValue","minimumPurchase","maximumDiscount","endDate","usageLimit","usagePerUser","active")
VALUES ('NOVA15','percentage',15,5000000,3000000,NOW() + INTERVAL '365 days',1000,1,TRUE)
ON CONFLICT ("code") DO NOTHING;

-- 4. Add promoCode + serviceFee + userId to Booking (if not exists)
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "promoCode"   TEXT,
  ADD COLUMN IF NOT EXISTS "serviceFee"  BIGINT NOT NULL DEFAULT 250000,
  ADD COLUMN IF NOT EXISTS "userId"      TEXT;

-- 5. Traveler table
CREATE TABLE IF NOT EXISTS "Traveler" (
  "id"             BIGSERIAL PRIMARY KEY,
  "bookingId"      BIGINT NOT NULL REFERENCES "Booking"("id") ON DELETE CASCADE,
  "fullName"       TEXT NOT NULL,
  "gender"         TEXT,
  "birthDate"      DATE,
  "nationality"    TEXT,
  "passportNumber" TEXT,
  "passportExpiry" DATE,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_traveler_booking ON "Traveler"("bookingId");

-- 6. Disable RLS on new tables
ALTER TABLE "SavedItinerary" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "PromoCode" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Traveler" DISABLE ROW LEVEL SECURITY;
