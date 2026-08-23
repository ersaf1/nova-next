-- Fix broken Unsplash image URLs (404) in Destination and Package tables
-- Generated: 2026-08-23

-- Broken photo IDs being replaced:
-- photo-1525874684015 → Cox's Bazar/Sundarbans, Kokoda/Mt.Hagen
-- photo-1476514525535 → Doha, Austria
-- photo-1641886783464 → Lake Assal, Bijagós Islands, Guinea-Bissau
-- photo-1558981803 → Prague, Monte Carlo

-- Destinations
UPDATE "Destination"
SET image = 'https://images.unsplash.com/photo-1567225591450-06036b3392a6?w=1600&q=90'
WHERE id = 986; -- Cox's Bazar & Sundarbans (beach/delta)

UPDATE "Destination"
SET image = 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=1600&q=90'
WHERE id = 430; -- Doha (city skyline)

UPDATE "Destination"
SET image = 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1600&q=90'
WHERE id = 537; -- Lake Assal & Lac Abbe (volcanic landscape)

UPDATE "Destination"
SET image = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1600&q=90'
WHERE id = 547; -- Bijagós Islands (tropical islands)

UPDATE "Destination"
SET image = 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1600&q=90'
WHERE id = 453; -- Prague (city architecture)

UPDATE "Destination"
SET image = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=90'
WHERE id = 586; -- Kokoda & Mt. Hagen (mountains/jungle)

-- Packages
UPDATE "Package"
SET image = 'https://images.unsplash.com/photo-1493707553966-283afac8c358?w=1600&q=90'
WHERE id = 186; -- Metro Tour Monte Carlo (luxury city)

UPDATE "Package"
SET image = 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1600&q=90'
WHERE id = 163; -- Jelajah Sejarah & Budaya Austria (Vienna/Austria)

UPDATE "Package"
SET image = 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1600&q=90'
WHERE id = 263; -- Eksotika Bahari Guinea-Bissau (tropical ocean)
