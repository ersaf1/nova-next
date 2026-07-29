-- Nova Travel Platform - Full Schema + Seed Data
-- Run this in Supabase Dashboard → SQL Editor

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists "Destination" (
  id bigint generated always as identity primary key,
  city text not null,
  country text not null,
  image text,
  description text,
  rating numeric(3,1) default 4.5,
  duration text,
  price text,
  category text,
  created_at timestamptz default now()
);

create table if not exists "Package" (
  id bigint generated always as identity primary key,
  tag text,
  "tagColor" text,
  title text not null,
  subtitle text,
  image text,
  price integer default 0,
  "originalPrice" integer default 0,
  duration text,
  "groupSize" text,
  rating numeric(3,1) default 4.5,
  reviews integer default 0,
  includes text default '[]',
  highlight text,
  category text,
  created_at timestamptz default now()
);

create table if not exists "FAQ" (
  id bigint generated always as identity primary key,
  q text not null,
  a text not null,
  created_at timestamptz default now()
);

create table if not exists "Testimonial" (
  id bigint generated always as identity primary key,
  name text not null,
  location text,
  avatar text,
  rating integer default 5,
  text text,
  trip text,
  created_at timestamptz default now()
);

create table if not exists "Booking" (
  id bigint generated always as identity primary key,
  "packageName" text,
  country text,
  name text not null,
  email text not null,
  phone text,
  "travelDate" text,
  participants integer default 1,
  notes text,
  status text default 'pending',
  "totalAmount" integer default 0,
  "midtrans_order_id" text,
  created_at timestamptz default now()
);

create table if not exists "Wishlist" (
  id bigint generated always as identity primary key,
  user_id text not null,
  destination_id bigint,
  created_at timestamptz default now()
);

create table if not exists "Hero" (
  id bigint generated always as identity primary key,
  headline text default 'The World, Unlocked.',
  subheadline text,
  "badgeText" text,
  "videoUrl" text,
  "posterUrl" text,
  updated_at timestamptz default now()
);

-- ============================================================
-- DISABLE RLS (service role access)
-- ============================================================

alter table "Destination" disable row level security;
alter table "Package" disable row level security;
alter table "FAQ" disable row level security;
alter table "Testimonial" disable row level security;
alter table "Booking" disable row level security;
alter table "Wishlist" disable row level security;
alter table "Hero" disable row level security;

-- ============================================================
-- SEED DATA - Destinations
-- ============================================================

insert into "Destination" (city, country, image, description, rating, duration, price, category) values
('Bali', 'Indonesia', '', 'Tropical paradise with stunning temples, rice terraces, and world-class surf beaches.', 4.9, '5-14 days', 'From $899', 'Beach'),
('Tokyo', 'Japan', '', 'A dazzling blend of ultramodern and traditional, neon lights and ancient temples.', 4.8, '7-14 days', 'From $1,299', 'City'),
('Santorini', 'Greece', '', 'Iconic white-washed villages perched on volcanic cliffs above the Aegean Sea.', 4.9, '5-10 days', 'From $1,199', 'Beach'),
('Paris', 'France', '', 'The city of light — art, cuisine, fashion, and the iconic Eiffel Tower.', 4.7, '4-10 days', 'From $1,099', 'City'),
('Queenstown', 'New Zealand', '', 'The adventure capital of the world, surrounded by dramatic alpine scenery.', 4.8, '7-14 days', 'From $1,499', 'Adventure'),
('Kyoto', 'Japan', '', 'Ancient capital with thousands of classical Buddhist temples and stunning gardens.', 4.9, '4-8 days', 'From $999', 'Cultural'),
('Maldives', 'Maldives', '', 'Overwater bungalows, crystal-clear lagoons, and the world finest coral reefs.', 5.0, '5-10 days', 'From $2,499', 'Beach'),
('Machu Picchu', 'Peru', '', 'The lost city of the Incas, hidden high in the Andes mountains of Peru.', 4.9, '7-12 days', 'From $1,399', 'Mountain'),
('Dubai', 'UAE', '', 'Futuristic skyline, luxury shopping, and desert adventures in one glittering city.', 4.7, '4-8 days', 'From $1,099', 'City'),
('Cape Town', 'South Africa', '', 'Where mountains meet the ocean — vineyards, safaris, and stunning coastal drives.', 4.8, '7-14 days', 'From $1,199', 'Adventure'),
('Barcelona', 'Spain', '', 'Gaudi architecture, vibrant nightlife, and Mediterranean beaches all in one city.', 4.8, '4-8 days', 'From $999', 'Cultural'),
('Swiss Alps', 'Switzerland', '', 'Pristine ski slopes, charming villages, and breathtaking alpine panoramas.', 4.9, '5-10 days', 'From $1,799', 'Mountain')
on conflict do nothing;

-- ============================================================
-- SEED DATA - Packages
-- ============================================================

insert into "Package" (tag, "tagColor", title, subtitle, image, price, "originalPrice", duration, "groupSize", rating, reviews, includes, highlight, category) values
('Best Seller', 'bg-amber-400 text-black', 'Bali Paradise Escape', 'Ubud • Seminyak • Uluwatu', '', 1299, 1599, '8 days', '2-12', 4.9, 248, '["Flights","Hotel","Tours","Breakfast"]', 'Temple & rice terrace tour included', 'Beach'),
('New', 'bg-emerald-400 text-black', 'Japan Cherry Blossom', 'Tokyo • Kyoto • Osaka', '', 2199, 2599, '12 days', '2-8', 4.8, 184, '["Flights","Hotel","JR Pass","Guide"]', 'Sakura season experience', 'City'),
('Luxury', 'bg-violet-400 text-white', 'Santorini Sunsets', 'Oia • Fira • Akrotiri', '', 2899, 3299, '7 days', '2-6', 4.9, 132, '["Flights","Villa","Wine tour","Yacht"]', 'Private villa with caldera view', 'Beach'),
('Adventure', 'bg-orange-400 text-black', 'Patagonia Trekking', 'Torres del Paine • El Calafate', '', 3199, 3699, '14 days', '4-12', 4.8, 96, '["Flights","Camping","Guide","Gear"]', 'W Circuit full trek', 'Mountain'),
('Popular', 'bg-sky-400 text-black', 'Maldives Overwater', 'North Male • Baa Atoll', '', 3999, 4599, '6 days', '2', 5.0, 211, '["Flights","Overwater villa","All meals","Diving"]', 'UNESCO Biosphere Reserve diving', 'Beach'),
('Cultural', 'bg-rose-400 text-white', 'Morocco Desert Dream', 'Marrakech • Fez • Sahara', '', 1499, 1799, '9 days', '2-10', 4.7, 167, '["Flights","Riad","Camel trek","Guide"]', 'Sahara desert overnight camp', 'City')
on conflict do nothing;

-- ============================================================
-- SEED DATA - FAQs
-- ============================================================

insert into "FAQ" (q, a) values
('How do I book a trip with NOVA?', 'Simply search for your destination, choose a package that suits your budget and preferences, fill in your travel details, and confirm your booking. The whole process takes less than 5 minutes.'),
('Can I customize my travel package?', 'Yes! Every package can be customized — you can adjust travel dates, number of travelers, room types, and add optional experiences. Contact our concierge team for fully bespoke itineraries.'),
('What is included in the package price?', 'Package prices include flights, accommodation, listed tours, and any meals specified in the package details. Airport transfers and travel insurance are optional add-ons available at checkout.'),
('How does the AI Itinerary Planner work?', 'Our AI Planner uses Gemini to generate a personalized day-by-day itinerary based on your destination, duration, budget, and interests. It suggests activities, restaurants, accommodation, and local tips — all in seconds.'),
('What is the cancellation policy?', 'Cancellations made more than 30 days before departure receive a full refund. Cancellations 14-30 days before receive a 50% refund. Within 14 days, refunds are subject to supplier terms.'),
('Is my payment secure?', 'Absolutely. All transactions are processed through encrypted payment gateways. We never store your card details, and all bookings are protected by our secure payment infrastructure.'),
('Can I book for a group?', 'Yes — most packages support groups of up to 12 people. For larger groups or corporate travel, please reach out to our team directly for special group rates and dedicated coordination.'),
('How do I get my e-ticket after booking?', 'Once payment is confirmed, your e-ticket and booking confirmation are instantly available on your dashboard under My Bookings. You can print or save your e-ticket from there.')
on conflict do nothing;

-- ============================================================
-- SEED DATA - Testimonials
-- ============================================================

insert into "Testimonial" (name, location, avatar, rating, text, trip) values
('Sarah Mitchell', 'New York, USA', '', 5, 'NOVA made our Bali honeymoon absolutely perfect. Every detail was taken care of — from the overwater villa to the private sunset cruise. Worth every penny.', 'Bali Paradise Escape'),
('James Chen', 'Singapore', '', 5, 'The Japan Cherry Blossom package was a dream. Seeing Kyoto in full bloom with a knowledgeable local guide was an experience I will never forget.', 'Japan Cherry Blossom'),
('Emma Laurent', 'Paris, France', '', 5, 'Santorini was even more magical than I imagined. The villa had the most stunning caldera views and the wine tour through Oia was incredible.', 'Santorini Sunsets')
on conflict do nothing;

-- ============================================================
-- SEED DATA - Hero
-- ============================================================

insert into "Hero" (headline, subheadline, "badgeText", "videoUrl", "posterUrl") values
('The World, Unlocked.', 'Plan, book, and experience extraordinary journeys across 150+ countries — all in one place.', 'Live availability · 150+ countries', '', '')
on conflict do nothing;
