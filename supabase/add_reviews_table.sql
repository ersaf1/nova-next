CREATE TABLE IF NOT EXISTS "Review" (
  id bigint generated always as identity primary key,
  user_id text not null,
  user_email text not null,
  user_name text not null,
  entity_type text not null CHECK (entity_type IN ('destination', 'package')),
  entity_id bigint not null,
  rating integer not null CHECK (rating BETWEEN 1 AND 5),
  title text,
  body text not null,
  created_at timestamptz default now()
);
ALTER TABLE "Review" DISABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS review_entity_idx ON "Review"(entity_type, entity_id);
