-- 007_places_cache.sql
create table if not exists places_cache (
  id          bigserial primary key,
  destination text        not null unique,  -- normalized: lowercase, hyphenated
  places      jsonb       not null,         -- GeoapifyPlace[]
  fetched_at  timestamptz not null default now()
);
