CREATE TABLE IF NOT EXISTS "Coupon" (
  id bigint generated always as identity primary key,
  code text not null unique,
  discount_type text not null CHECK (discount_type IN ('percent', 'fixed')),
  discount_value integer not null,
  min_amount integer default 0,
  max_uses integer default 100,
  used_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);
ALTER TABLE "Coupon" DISABLE ROW LEVEL SECURITY;

INSERT INTO "Coupon" (code, discount_type, discount_value, min_amount, max_uses)
VALUES ('NOVA15', 'percent', 15, 100000, 1000) ON CONFLICT DO NOTHING;

INSERT INTO "Coupon" (code, discount_type, discount_value, min_amount, max_uses)
VALUES ('WELCOME50', 'fixed', 50000, 200000, 500) ON CONFLICT DO NOTHING;

