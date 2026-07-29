-- ============================================================
-- NOVA Migration 002: Extend Package and Destination tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add name + slug to Destination
ALTER TABLE "Destination"
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Backfill name from city
UPDATE "Destination" SET "name" = city WHERE "name" IS NULL;

-- Backfill slug from city (lowercase, spaces to hyphens, remove special chars)
UPDATE "Destination"
SET "slug" = lower(regexp_replace(
  regexp_replace(city, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE "slug" IS NULL;

-- 2. Add new columns to Package
ALTER TABLE "Package"
  ADD COLUMN IF NOT EXISTS "slug"             TEXT,
  ADD COLUMN IF NOT EXISTS "destinationId"    BIGINT REFERENCES "Destination"("id"),
  ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "description"      TEXT,
  ADD COLUMN IF NOT EXISTS "durationDays"     INTEGER,
  ADD COLUMN IF NOT EXISTS "durationNights"   INTEGER,
  ADD COLUMN IF NOT EXISTS "coverImage"       TEXT,
  ADD COLUMN IF NOT EXISTS "gallery"          TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "excluded"         TEXT DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "status"           TEXT NOT NULL DEFAULT 'published'
    CHECK ("status" IN ('draft','published','archived')),
  ADD COLUMN IF NOT EXISTS "updatedAt"        TIMESTAMPTZ DEFAULT NOW();

-- Backfill slug from title (lowercase, remove special chars, spaces to hyphens)
UPDATE "Package"
SET "slug" = lower(regexp_replace(
  regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
  '\s+', '-', 'g'
))
WHERE "slug" IS NULL;

-- Backfill coverImage from existing image column
UPDATE "Package" SET "coverImage" = image WHERE "coverImage" IS NULL AND image IS NOT NULL;

-- Backfill shortDescription from subtitle/highlight
UPDATE "Package"
SET "shortDescription" = COALESCE(subtitle, highlight)
WHERE "shortDescription" IS NULL AND (subtitle IS NOT NULL OR highlight IS NOT NULL);

-- Backfill description from highlight
UPDATE "Package"
SET "description" = highlight
WHERE "description" IS NULL AND highlight IS NOT NULL;

-- 3. Deduplicate slugs before creating unique index
-- If two packages produce the same slug, append the id to make it unique
UPDATE "Package" p1
SET "slug" = p1."slug" || '-' || p1.id
WHERE EXISTS (
  SELECT 1 FROM "Package" p2
  WHERE p2."slug" = p1."slug" AND p2.id < p1.id
);

-- Same for destinations
UPDATE "Destination" d1
SET "slug" = d1."slug" || '-' || d1.id
WHERE EXISTS (
  SELECT 1 FROM "Destination" d2
  WHERE d2."slug" = d1."slug" AND d2.id < d1.id
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_package_slug ON "Package"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS idx_destination_slug ON "Destination"("slug");

-- Index for destinationId lookup
CREATE INDEX IF NOT EXISTS idx_package_destination ON "Package"("destinationId");

-- 4. Create PackageDeparture table if not exists (idempotent)
CREATE TABLE IF NOT EXISTS "PackageDeparture" (
  "id"             BIGSERIAL PRIMARY KEY,
  "packageId"      BIGINT NOT NULL REFERENCES "Package"("id") ON DELETE CASCADE,
  "startDate"      DATE NOT NULL,
  "endDate"        DATE NOT NULL,
  "capacity"       INTEGER NOT NULL DEFAULT 20,
  "remainingSlots" INTEGER NOT NULL DEFAULT 20,
  "price"          BIGINT NOT NULL,
  "status"         TEXT NOT NULL DEFAULT 'available'
    CHECK ("status" IN ('available', 'limited', 'sold_out', 'cancelled')),
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departure_package ON "PackageDeparture"("packageId");
CREATE INDEX IF NOT EXISTS idx_departure_status  ON "PackageDeparture"("status");
CREATE INDEX IF NOT EXISTS idx_departure_start   ON "PackageDeparture"("startDate");

-- 5. Auto-update updatedAt trigger for PackageDeparture
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS departure_updated_at ON "PackageDeparture";
CREATE TRIGGER departure_updated_at
  BEFORE UPDATE ON "PackageDeparture"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 6. decrement_departure_slots RPC (used by booking API)
CREATE OR REPLACE FUNCTION decrement_departure_slots(p_departure_id BIGINT, p_count INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE "PackageDeparture"
  SET
    "remainingSlots" = GREATEST(0, "remainingSlots" - p_count),
    "status" = CASE
      WHEN ("remainingSlots" - p_count) <= 0 THEN 'sold_out'
      WHEN ("remainingSlots" - p_count) <= 3 THEN 'limited'
      ELSE "status"
    END,
    "updatedAt" = NOW()
  WHERE id = p_departure_id;
END;
$$ LANGUAGE plpgsql;

-- 7. Seed departures for all published packages (2 per package: 30 days out, 60 days out)
-- Run this section separately after confirming slugs look correct.
-- Uncomment when ready:
--
-- INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
-- SELECT id,
--   (NOW()::date + 30),
--   (NOW()::date + 30 + COALESCE("durationDays", 7) - 1),
--   20, 20, price, 'available'
-- FROM "Package" WHERE "status" = 'published'
-- ON CONFLICT DO NOTHING;
--
-- INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
-- SELECT id,
--   (NOW()::date + 60),
--   (NOW()::date + 60 + COALESCE("durationDays", 7) - 1),
--   20, 8, price, 'limited'
-- FROM "Package" WHERE "status" = 'published'
-- ON CONFLICT DO NOTHING;
