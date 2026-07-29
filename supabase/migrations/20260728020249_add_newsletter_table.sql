CREATE TABLE IF NOT EXISTS "Newsletter" (
  id bigint generated always as identity primary key,
  email text not null unique,
  subscribed_at timestamptz default now(),
  is_active boolean default true
);
ALTER TABLE "Newsletter" DISABLE ROW LEVEL SECURITY;

