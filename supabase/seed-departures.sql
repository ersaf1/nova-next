-- ============================================================
-- NOVA — Seed PackageDeparture
-- Jadwal keberangkatan untuk semua package valid
-- Run di Supabase SQL Editor
-- ============================================================

-- Hapus jadwal lama yang mungkin duplikat
DELETE FROM "PackageDeparture"
WHERE "packageId" IN (
  SELECT id FROM "Package"
  WHERE slug IN (
    'bali-paradise-escape',
    'japan-cherry-blossom',
    'santorini-sunsets-villa',
    'swiss-alps-experience',
    'maldives-overwater-luxury',
    'paris-french-riviera'
  )
);

-- ─── Bali Paradise Escape (8H7M, Beach) ─────────────────────
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT p.id, d.start, d.start + INTERVAL '7 days', d.cap, d.slots, p.price, d.status
FROM "Package" p,
(VALUES
  ('2026-08-04'::date, 20, 14, 'available'),
  ('2026-08-18'::date, 20, 8,  'limited'),
  ('2026-09-01'::date, 20, 20, 'available'),
  ('2026-09-15'::date, 20, 20, 'available'),
  ('2026-10-06'::date, 20, 5,  'limited'),
  ('2026-10-20'::date, 20, 20, 'available'),
  ('2026-11-03'::date, 20, 20, 'available'),
  ('2026-11-17'::date, 20, 12, 'available'),
  ('2026-12-02'::date, 20, 3,  'limited'),
  ('2026-12-16'::date, 20, 20, 'available')
) AS d(start, cap, slots, status)
WHERE p.slug = 'bali-paradise-escape';

-- ─── Japan Cherry Blossom Tour (12H11M, City) ───────────────
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT p.id, d.start, d.start + INTERVAL '11 days', d.cap, d.slots, p.price, d.status
FROM "Package" p,
(VALUES
  ('2026-08-10'::date, 15, 15, 'available'),
  ('2026-08-24'::date, 15, 6,  'limited'),
  ('2026-09-07'::date, 15, 15, 'available'),
  ('2026-09-21'::date, 15, 15, 'available'),
  ('2026-10-05'::date, 15, 2,  'limited'),
  ('2026-10-19'::date, 15, 15, 'available'),
  ('2026-11-02'::date, 15, 15, 'available'),
  ('2026-11-23'::date, 15, 9,  'available'),
  ('2026-12-07'::date, 15, 15, 'available'),
  ('2026-12-21'::date, 15, 15, 'available')
) AS d(start, cap, slots, status)
WHERE p.slug = 'japan-cherry-blossom';

-- ─── Santorini Sunsets Villa (7H6M, Beach/Luxury) ───────────
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT p.id, d.start, d.start + INTERVAL '6 days', d.cap, d.slots, p.price, d.status
FROM "Package" p,
(VALUES
  ('2026-08-07'::date, 10, 4,  'limited'),
  ('2026-08-21'::date, 10, 10, 'available'),
  ('2026-09-04'::date, 10, 10, 'available'),
  ('2026-09-18'::date, 10, 7,  'available'),
  ('2026-10-02'::date, 10, 10, 'available'),
  ('2026-10-16'::date, 10, 10, 'available'),
  ('2026-11-06'::date, 10, 3,  'limited'),
  ('2026-11-20'::date, 10, 10, 'available'),
  ('2026-12-04'::date, 10, 10, 'available'),
  ('2026-12-18'::date, 10, 10, 'available')
) AS d(start, cap, slots, status)
WHERE p.slug = 'santorini-sunsets-villa';

-- ─── Swiss Alps Ski & Mountain (9H8M, Mountain) ─────────────
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT p.id, d.start, d.start + INTERVAL '8 days', d.cap, d.slots, p.price, d.status
FROM "Package" p,
(VALUES
  ('2026-08-03'::date, 12, 12, 'available'),
  ('2026-08-17'::date, 12, 12, 'available'),
  ('2026-09-07'::date, 12, 5,  'limited'),
  ('2026-09-21'::date, 12, 12, 'available'),
  ('2026-10-05'::date, 12, 12, 'available'),
  ('2026-10-19'::date, 12, 8,  'available'),
  ('2026-11-09'::date, 12, 12, 'available'),
  ('2026-11-23'::date, 12, 12, 'available'),
  ('2026-12-07'::date, 12, 1,  'limited'),
  ('2026-12-21'::date, 12, 12, 'available')
) AS d(start, cap, slots, status)
WHERE p.slug = 'swiss-alps-experience';

-- ─── Maldives Overwater Luxury (6H5M, Beach/Luxury) ─────────
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT p.id, d.start, d.start + INTERVAL '5 days', d.cap, d.slots, p.price, d.status
FROM "Package" p,
(VALUES
  ('2026-08-05'::date, 8, 2,  'limited'),
  ('2026-08-19'::date, 8, 8,  'available'),
  ('2026-09-02'::date, 8, 8,  'available'),
  ('2026-09-16'::date, 8, 4,  'limited'),
  ('2026-10-07'::date, 8, 8,  'available'),
  ('2026-10-21'::date, 8, 8,  'available'),
  ('2026-11-04'::date, 8, 8,  'available'),
  ('2026-11-18'::date, 8, 6,  'available'),
  ('2026-12-02'::date, 8, 8,  'available'),
  ('2026-12-23'::date, 8, 8,  'available')
) AS d(start, cap, slots, status)
WHERE p.slug = 'maldives-overwater-luxury';

-- ─── Paris & French Riviera (8H7M, City) ────────────────────
INSERT INTO "PackageDeparture" ("packageId","startDate","endDate","capacity","remainingSlots","price","status")
SELECT p.id, d.start, d.start + INTERVAL '7 days', d.cap, d.slots, p.price, d.status
FROM "Package" p,
(VALUES
  ('2026-08-06'::date, 16, 16, 'available'),
  ('2026-08-20'::date, 16, 7,  'limited'),
  ('2026-09-03'::date, 16, 16, 'available'),
  ('2026-09-17'::date, 16, 16, 'available'),
  ('2026-10-01'::date, 16, 11, 'available'),
  ('2026-10-15'::date, 16, 16, 'available'),
  ('2026-11-05'::date, 16, 16, 'available'),
  ('2026-11-19'::date, 16, 4,  'limited'),
  ('2026-12-03'::date, 16, 16, 'available'),
  ('2026-12-17'::date, 16, 16, 'available')
) AS d(start, cap, slots, status)
WHERE p.slug = 'paris-french-riviera';

-- Verifikasi hasil
SELECT
  pkg.title,
  pkg.slug,
  COUNT(dep.id) AS total_jadwal,
  MIN(dep."startDate") AS jadwal_pertama,
  MAX(dep."startDate") AS jadwal_terakhir
FROM "Package" pkg
JOIN "PackageDeparture" dep ON dep."packageId" = pkg.id
GROUP BY pkg.id, pkg.title, pkg.slug
ORDER BY pkg.title;
