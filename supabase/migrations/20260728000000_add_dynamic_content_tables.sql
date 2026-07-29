-- Dynamic content tables for Nova Next
-- Run this migration in Supabase SQL editor

-- ============================================================
-- SiteStats: stats bar + testimonial footer + app cta stats
-- ============================================================
CREATE TABLE IF NOT EXISTS "SiteStats" (
  id SERIAL PRIMARY KEY,
  "statKey" TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  "iconName" TEXT,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Default stats
INSERT INTO "SiteStats" ("statKey", value, label, "iconName", "sortOrder") VALUES
  ('countries', '150+', 'Countries', 'Globe', 1),
  ('hotels', '10K+', 'Hotels & Resorts', 'Building2', 2),
  ('airlines', '500+', 'Airlines', 'Plane', 3),
  ('travelers', '2M+', 'Happy Travelers', 'Users', 4),
  ('app_rating', '4.9/5', 'App Store rating', NULL, 5),
  ('recommend_rate', '98%', 'Would recommend', NULL, 6),
  ('app_store_stars', '4.9★', 'App Store', NULL, 7),
  ('app_reviews', '150K', 'Reviews', NULL, 8),
  ('app_downloads', '2M+', 'Downloads', NULL, 9)
ON CONFLICT ("statKey") DO NOTHING;

-- ============================================================
-- Partner: hero section marquee brands
-- ============================================================
CREATE TABLE IF NOT EXISTS "Partner" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  "fontFamily" TEXT DEFAULT 'Arial, sans-serif',
  "fontWeight" INTEGER DEFAULT 700,
  "letterSpacing" TEXT DEFAULT '0em',
  "fontSize" TEXT DEFAULT '14px',
  "fontStyle" TEXT DEFAULT 'normal',
  "textTransform" TEXT DEFAULT 'none',
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "Partner" (name, "fontFamily", "fontWeight", "letterSpacing", "fontSize", "sortOrder") VALUES
  ('Airbnb', 'Georgia, serif', 700, '-0.02em', '15px', 1),
  ('Booking.com', 'Arial, sans-serif', 900, '0.08em', '13px', 2),
  ('Expedia', 'Trebuchet MS, sans-serif', 600, '0.01em', '15px', 3),
  ('Skyscanner', 'Courier New, monospace', 700, '0.12em', '13px', 4),
  ('Klook', 'Palatino, Book Antiqua, serif', 400, '-0.01em', '16px', 5),
  ('Agoda', 'Impact, Arial Narrow, sans-serif', 400, '0.04em', '14px', 6),
  ('TripAdvisor', 'Verdana, sans-serif', 700, '-0.03em', '13px', 7)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Backer: backed by section marquee
-- ============================================================
CREATE TABLE IF NOT EXISTS "Backer" (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  "fontFamily" TEXT DEFAULT 'Arial, sans-serif',
  "fontWeight" INTEGER DEFAULT 700,
  "letterSpacing" TEXT DEFAULT '0em',
  "fontSize" TEXT DEFAULT '14px',
  "textTransform" TEXT DEFAULT 'none',
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "Backer" (name, "fontFamily", "fontWeight", "letterSpacing", "fontSize", "sortOrder") VALUES
  ('Fundamental Labs', 'Times New Roman, serif', 400, '0.02em', '14px', 1),
  ('Emirates', 'Arial Black, sans-serif', 900, '0.08em', '16px', 2),
  ('Marriott', 'Impact, sans-serif', 700, '0.05em', '18px', 3),
  ('Visa', 'Georgia, serif', 600, '-0.02em', '17px', 4),
  ('Mastercard', 'Helvetica, Arial, sans-serif', 700, '-0.01em', '15px', 5),
  ('Hyatt', 'Verdana, sans-serif', 700, '0.06em', '14px', 6),
  ('Hilton', 'Courier New, monospace', 700, '0.18em', '14px', 7),
  ('Stripe', 'Palatino, serif', 500, '0.03em', '15px', 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Feature: why nova section cards
-- ============================================================
CREATE TABLE IF NOT EXISTS "Feature" (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  stat TEXT NOT NULL,
  "statLabel" TEXT NOT NULL,
  "iconName" TEXT NOT NULL,
  image TEXT NOT NULL,
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "Feature" (title, stat, "statLabel", "iconName", image, "sortOrder") VALUES
  ('Lightning booking', '< 3 min', 'avg. booking time', 'Zap', '', 1),
  ('Price guarantee', '100%', 'price matched', 'Shield', '', 2),
  ('24/7 support', '24/7', 'concierge', 'Headphones', '', 3),
  ('Flexible pay', '50+', 'currencies', 'CreditCard', '', 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- HowItWorksStep: how it works section cards
-- ============================================================
CREATE TABLE IF NOT EXISTS "HowItWorksStep" (
  id SERIAL PRIMARY KEY,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  "iconName" TEXT NOT NULL,
  image TEXT NOT NULL,
  "sortOrder" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO "HowItWorksStep" (number, title, caption, "iconName", image, "sortOrder") VALUES
  ('01', 'Search', 'Find by mood, season, or style.', 'Search', '', 1),
  ('02', 'Book', 'Flights, hotels, experiences — one checkout.', 'BookOpen', '', 2),
  ('03', 'Explore', 'Itinerary in your pocket. 24/7 concierge.', 'Compass', '', 3)
ON CONFLICT DO NOTHING;
