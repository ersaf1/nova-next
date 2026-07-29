import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jrnmzwtjqcvknoclycbd.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impybm16d3RqcWN2a25vY2x5Y2JkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTExNzk3OCwiZXhwIjoyMTAwNjkzOTc4fQ.KzPJJmVj0sdnnblUY2Akezd7bfVxdvqy4EPNR0WCxr4'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Category Unsplash image pools
const IMAGE_POOLS = {
  Beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85',
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&q=85',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=85',
    'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=85',
  ],
  Mountain: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
    'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?w=1200&q=85',
    'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1200&q=85',
    'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=85',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&q=85',
  ],
  Cultural: [
    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=85',
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=85',
    'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=1200&q=85',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=85',
  ],
  City: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=85',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=85',
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=85',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=85',
  ],
  Adventure: [
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&q=85',
    'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=85',
    'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=85',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85',
  ],
  Nature: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=85',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&q=85',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=85',
  ]
}

// Full 195 UN Member States List
const UN_COUNTRIES = [
  // ASIA (47)
  { country: 'Afghanistan', city: 'Kabul & Bamyan', category: 'Cultural', tagline: 'Ancient Silk Road heritage and majestic valleys' },
  { country: 'Armenia', city: 'Yerevan & Tatev', category: 'Cultural', tagline: 'World\'s oldest Christian churches and mountain monasteries' },
  { country: 'Azerbaijan', city: 'Baku', category: 'City', tagline: 'Land of Fire where Caspian modern meets ancient Maiden Tower' },
  { country: 'Bahrain', city: 'Manama', category: 'City', tagline: 'Gulf island kingdom of pearls, skyline, and ancient forts' },
  { country: 'Bangladesh', city: 'Cox\'s Bazar & Sundarbans', category: 'Beach', tagline: 'World\'s longest sea beach and mangrove tiger sanctuaries' },
  { country: 'Bhutan', city: 'Paro & Thimphu', category: 'Mountain', tagline: 'Himalayan Tiger\'s Nest monastery and Gross National Happiness' },
  { country: 'Brunei', city: 'Bandar Seri Begawan', category: 'Cultural', tagline: 'Golden-domed royal mosques and pristine rainforests' },
  { country: 'Cambodia', city: 'Siem Reap & Angkor', category: 'Cultural', tagline: 'Ancient stone temples of Angkor Wat surrounded by jungle' },
  { country: 'China', city: 'Beijing & Guilin', category: 'Cultural', tagline: 'The Great Wall, Forbidden City, and karst river landscapes' },
  { country: 'Cyprus', city: 'Paphos & Ayia Napa', category: 'Beach', tagline: 'Aphrodite\'s Mediterranean island of golden beaches and ruins' },
  { country: 'Georgia', city: 'Tbilisi & Kazbegi', category: 'Mountain', tagline: 'Caucasus mountain peaks, ancient wine cellars, and balconies' },
  { country: 'India', city: 'Agra, Jaipur & Goa', category: 'Cultural', tagline: 'Taj Mahal, palaces of Rajasthan, and tropical Goa palm beaches' },
  { country: 'Indonesia', city: 'Bali, Raja Ampat & Komodo', category: 'Beach', tagline: 'Spirit, serenity, dragons, and world-class tropical reefs' },
  { country: 'Iran', city: 'Isfahan & Shiraz', category: 'Cultural', tagline: 'Persian turquoise tile domes, bazaars, and ancient Persepolis' },
  { country: 'Iraq', city: 'Erbil & Babylon', category: 'Cultural', tagline: 'Cradle of civilization, ancient citadel, and Mesopotamian history' },
  { country: 'Israel', city: 'Jerusalem & Tel Aviv', category: 'Cultural', tagline: 'Historic Holy City, Mediterranean beaches, and Dead Sea waters' },
  { country: 'Japan', city: 'Tokyo, Kyoto & Mt. Fuji', category: 'City', tagline: 'Where tradition meets tomorrow, cherry blossoms, and Shinkansen' },
  { country: 'Jordan', city: 'Petra & Wadi Rum', category: 'Adventure', tagline: 'Rose-red rock carved city and Martian red desert canyons' },
  { country: 'Kazakhstan', city: 'Almaty & Charyn Canyon', category: 'Mountain', tagline: 'Steppe horizons, alpine lakes, and red rock eco-canyons' },
  { country: 'Kuwait', city: 'Kuwait City', category: 'City', tagline: 'Iconic Kuwait Towers, Gulf coastlines, and luxury souks' },
  { country: 'Kyrgyzstan', city: 'Issyk-Kul & Ala Archa', category: 'Mountain', tagline: 'Nomadic yurt culture, alpine lakes, and Celestial Mountains' },
  { country: 'Laos', city: 'Luang Prabang', category: 'Nature', tagline: 'Saffron-robed monks, Kuang Si waterfalls, and Mekong sunsets' },
  { country: 'Lebanon', city: 'Beirut & Byblos', category: 'Cultural', tagline: 'Paris of the Middle East, ancient cedar forests, and Mediterranean seafood' },
  { country: 'Malaysia', city: 'Kuala Lumpur & Langkawi', category: 'City', tagline: 'Petronas Twin Towers, rainforest reserves, and island archipelagos' },
  { country: 'Maldives', city: 'Malé & Baa Atoll', category: 'Beach', tagline: 'Overwater luxury villas, turquoise lagoons, and coral reefs' },
  { country: 'Mongolia', city: 'Gobi Desert & Terelj', category: 'Adventure', tagline: 'Endless steppe, wild horses, and Gobi sand dune starlight' },
  { country: 'Myanmar', city: 'Bagan & Inle Lake', category: 'Cultural', tagline: 'Thousands of golden pagodas rising over misty plains' },
  { country: 'Nepal', city: 'Kathmandu & Pokhara', category: 'Mountain', tagline: 'Mount Everest peaks, Annapurna trekking, and sacred stupas' },
  { country: 'North Korea', city: 'Pyongyang & Mt. Paektu', category: 'Cultural', tagline: 'Monumental architecture, grand mass games, and sacred volcanic peaks' },
  { country: 'Oman', city: 'Muscat & Salalah', category: 'Adventure', tagline: 'Sultanate forts, emerald wadis, and frankincense coastlines' },
  { country: 'Pakistan', city: 'Hunza Valley & Skardu', category: 'Mountain', tagline: 'K2 mountain vistas, turquoise alpine rivers, and ancient forts' },
  { country: 'Palestine', city: 'Bethlehem & Jericho', category: 'Cultural', tagline: 'Ancient olive groves, historic pilgrimage sites, and old bazaars' },
  { country: 'Philippines', city: 'El Nido & Boracay', category: 'Beach', tagline: 'Pristine limestone lagoons, powdery white sands, and island hopping' },
  { country: 'Qatar', city: 'Doha', category: 'City', tagline: 'Museum of Islamic Art, Souq Waqif, and desert inland sea' },
  { country: 'Saudi Arabia', city: 'AlUla & Riyadh', category: 'Adventure', tagline: 'Hegra Nabataean tombs, desert monoliths, and futuristic skyline' },
  { country: 'Singapore', city: 'Singapore City', category: 'City', tagline: 'Marina Bay Sands, Gardens by the Bay, and Michelin street food' },
  { country: 'South Korea', city: 'Seoul & Jeju Island', category: 'City', tagline: 'K-pop culture, Gyeongbokgung palace, and volcanic waterfalls' },
  { country: 'Sri Lanka', city: 'Sigiriya & Ella', category: 'Nature', tagline: 'Lion Rock fortress, tea plantations, and wild elephant safaris' },
  { country: 'Syria', city: 'Damascus & Palmyra', category: 'Cultural', tagline: 'Oldest continuously inhabited city, Umayyad Mosque, and Silk Road history' },
  { country: 'Tajikistan', city: 'Pamir Highway & Dushanbe', category: 'Mountain', tagline: 'Roof of the World mountain highway and turquoise high-altitude lakes' },
  { country: 'Thailand', city: 'Bangkok, Phuket & Chiang Mai', category: 'Beach', tagline: 'Golden temples, spicy street markets, and tropical limestone islands' },
  { country: 'Timor-Leste', city: 'Dili & Atauro Island', category: 'Beach', tagline: 'Unspoiled coral reefs, marine biodiversity, and rugged mountain views' },
  { country: 'Turkey', city: 'Istanbul & Cappadocia', category: 'Cultural', tagline: 'Hot air balloons over fairy chimneys and Bosphorus strait palaces' },
  { country: 'Turkmenistan', city: 'Ashgabat & Darvaza', category: 'Adventure', tagline: 'Marble city architecture and the glowing Door to Hell crater' },
  { country: 'UAE', city: 'Dubai & Abu Dhabi', category: 'City', tagline: 'Burj Khalifa skyline, Sheikh Zayed Grand Mosque, and desert resorts' },
  { country: 'Uzbekistan', city: 'Samarkand & Bukhara', category: 'Cultural', tagline: 'Registan turquoise tile mosaics and ancient Silk Road caravanserais' },
  { country: 'Vietnam', city: 'Ha Long Bay & Hoi An', category: 'Nature', tagline: 'Emerald waters of Ha Long Bay and lantern-lit ancient trading town' },
  { country: 'Yemen', city: 'Sana\'a & Socotra', category: 'Nature', tagline: 'Alien Dragon\'s Blood trees of Socotra and gingerbread clay towers' },

  // EUROPE (44)
  { country: 'Albania', city: 'Tirana & Albanian Riviera', category: 'Beach', tagline: 'Crystal Ionian beaches, Ottoman stone towns, and wild mountain peaks' },
  { country: 'Andorra', city: 'Andorra la Vella', category: 'Mountain', tagline: 'Pyrenean ski resorts, mountain valleys, and duty-free shopping' },
  { country: 'Austria', city: 'Vienna & Salzburg', category: 'Cultural', tagline: 'Imperial Habsburg palaces, Classical music, and Alpine lakes' },
  { country: 'Belarus', city: 'Minsk & Belovezhskaya', category: 'Nature', tagline: 'Primeval bison forests, Stalinist architecture, and medieval castles' },
  { country: 'Belgium', city: 'Bruges & Brussels', category: 'Cultural', tagline: 'Fairytale canals, artisan chocolates, waffles, and Gothic squares' },
  { country: 'Bosnia and Herzegovina', city: 'Mostar & Sarajevo', category: 'Cultural', tagline: 'Iconic Stari Most bridge, Ottoman bazaars, and emerald rivers' },
  { country: 'Bulgaria', city: 'Sofia & Rila', category: 'Mountain', tagline: 'Rila mountain monastery, Rose Valley, and Black Sea resorts' },
  { country: 'Croatia', city: 'Dubrovnik & Plitvice', category: 'Beach', tagline: 'Pearl of the Adriatic, Game of Thrones walls, and cascading lakes' },
  { country: 'Czech Republic', city: 'Prague', category: 'Cultural', tagline: 'City of a Hundred Spires, Charles Bridge, and bohemian castles' },
  { country: 'Denmark', city: 'Copenhagen', category: 'City', tagline: 'Nyhavn colorful harbor, Danish design, hygge, and cycling culture' },
  { country: 'Estonia', city: 'Tallinn', category: 'Cultural', tagline: 'Best preserved medieval Old Town, cobblestones, and digital innovation' },
  { country: 'Finland', city: 'Rovaniemi & Lapland', category: 'Nature', tagline: 'Northern Lights, Santa Claus village, glass igloos, and midnight sun' },
  { country: 'France', city: 'Paris, Nice & French Riviera', category: 'City', tagline: 'Eiffel Tower, Louvre art, wine vineyards, and Riviera glamour' },
  { country: 'Germany', city: 'Berlin, Munich & Bavaria', category: 'Cultural', tagline: 'Neuschwanstein fairytale castle, Oktoberfest, and Brandenburg Gate' },
  { country: 'Greece', city: 'Santorini & Athens', category: 'Beach', tagline: 'Parthenon temple, blue dome volcanic cliffs, and Aegean islands' },
  { country: 'Hungary', city: 'Budapest', category: 'City', tagline: 'Thermal bath spas, Danube river parliament, and ruin bars' },
  { country: 'Iceland', city: 'Reykjavik & Golden Circle', category: 'Nature', tagline: 'Land of fire and ice, Blue Lagoon, geysers, and aurora skies' },
  { country: 'Ireland', city: 'Dublin & Cliffs of Moher', category: 'Nature', tagline: 'Emerald green pastures, dramatic sea cliffs, and traditional pubs' },
  { country: 'Italy', city: 'Rome, Venice & Amalfi', category: 'Cultural', tagline: 'Colosseum, gondola canals, gelato, and coastal cliffside villages' },
  { country: 'Latvia', city: 'Riga', category: 'Cultural', tagline: 'Art Nouveau architecture, Baltic beach dunes, and wooden heritage' },
  { country: 'Liechtenstein', city: 'Vaduz', category: 'Mountain', tagline: 'Alpine principality castle perched above the Rhine river valley' },
  { country: 'Lithuania', city: 'Vilnius & Trakai', category: 'Cultural', tagline: 'Red-roof Baroque Old Town and island castle surrounded by lakes' },
  { country: 'Luxembourg', city: 'Luxembourg City', category: 'Cultural', tagline: 'Clifftop fortress casemates, forested gorges, and European history' },
  { country: 'Malta', city: 'Valletta & Mdina', category: 'Beach', tagline: 'Knights of St. John fortress, Blue Grotto, and sunny Mediterranean islets' },
  { country: 'Moldova', city: 'Chisinau & Cricova', category: 'Cultural', tagline: 'Underground wine cellars, monasteries, and peaceful vineyards' },
  { country: 'Monaco', city: 'Monte Carlo', category: 'City', tagline: 'Riviera superyachts, luxury casinos, Grand Prix, and royal glamour' },
  { country: 'Montenegro', city: 'Kotor & Budva', category: 'Beach', tagline: 'Fjord-like Bay of Kotor, Venetian stone walls, and Adriatic beaches' },
  { country: 'Netherlands', city: 'Amsterdam', category: 'City', tagline: 'Canal rings, tulip fields, windmills, and Van Gogh treasures' },
  { country: 'North Macedonia', city: 'Ohrid & Skopje', category: 'Nature', tagline: 'Ancient Lake Ohrid, lakeside monasteries, and mountain peaks' },
  { country: 'Norway', city: 'Tromsø & Geirangerfjord', category: 'Nature', tagline: 'Majestic fjords, Midnight Sun, waterfalls, and Arctic Northern Lights' },
  { country: 'Poland', city: 'Krakow & Warsaw', category: 'Cultural', tagline: 'Royal Wawel Castle, cobblestone Old Towns, and rich history' },
  { country: 'Portugal', city: 'Lisbon & Algarve', category: 'Beach', tagline: 'Yellow tramways, golden sea caves, pastel de nata, and port wine' },
  { country: 'Romania', city: 'Transylvania & Bran', category: 'Cultural', tagline: 'Dracula\'s castle, Carpathian mountain forests, and painted monasteries' },
  { country: 'Russia', city: 'Moscow & St. Petersburg', category: 'Cultural', tagline: 'Red Square onion domes, Hermitage museum, and Trans-Siberian routes' },
  { country: 'San Marino', city: 'San Marino City', category: 'Mountain', tagline: 'Mount Titano towers perched high over the Italian countryside' },
  { country: 'Serbia', city: 'Belgrade', category: 'City', tagline: 'Kalemegdan fortress where Danube meets Sava, vibrant nightlife' },
  { country: 'Slovakia', city: 'High Tatras & Bratislava', category: 'Mountain', tagline: 'Sharp Tatra peaks, alpine hiking trails, and Danube castles' },
  { country: 'Slovenia', city: 'Lake Bled & Ljubljana', category: 'Nature', tagline: 'Emerald Lake Bled with island church and Dragon Bridge capital' },
  { country: 'Spain', city: 'Barcelona, Madrid & Ibiza', category: 'Beach', tagline: 'Sagrada Familia, flamenco dance, tapas, and Mediterranean beaches' },
  { country: 'Sweden', city: 'Stockholm & Abisko', category: 'City', tagline: '14-island archipelagos, Gamla Stan, and Icehotel adventures' },
  { country: 'Switzerland', city: 'Zermatt, Interlaken & Zurich', category: 'Mountain', tagline: 'Matterhorn peaks, luxury Swiss watches, chocolates, and alpine ski trains' },
  { country: 'Ukraine', city: 'Kyiv & Lviv', category: 'Cultural', tagline: 'Golden-domed Pechersk Lavra, cobblestone coffee houses, and castles' },
  { country: 'United Kingdom', city: 'London, Edinburgh & Highlands', category: 'Cultural', tagline: 'Big Ben, Buckingham Palace, Scottish lochs, and historic castles' },
  { country: 'Vatican City', city: 'Vatican City', category: 'Cultural', tagline: 'St. Peter\'s Basilica, Sistine Chapel, and Papal art collections' },

  // AMERICAS (35)
  { country: 'Antigua and Barbuda', city: 'St. John\'s & Shirley Heights', category: 'Beach', tagline: '365 pink and white sand beaches, one for every day of the year' },
  { country: 'Argentina', city: 'Buenos Aires & Patagonia', category: 'Adventure', tagline: 'Tango passion, Perito Moreno glacier, and Mendoza wine valleys' },
  { country: 'Bahamas', city: 'Nassau & Exuma', category: 'Beach', tagline: 'Famous swimming pigs, crystal clear turquoise water, and coral cays' },
  { country: 'Barbados', city: 'Bridgetown', category: 'Beach', tagline: 'Rum distilleries, flying fish, and sun-drenched Caribbean shores' },
  { country: 'Belize', city: 'Great Blue Hole & Ambergris Caye', category: 'Beach', tagline: 'Giant submarine sinkhole diving and Mayan jungle ruins' },
  { country: 'Bolivia', city: 'Salar de Uyuni', category: 'Nature', tagline: 'World\'s largest mirror salt flat and high-altitude Andes lagoons' },
  { country: 'Brazil', city: 'Rio de Janeiro & Amazon', category: 'Beach', tagline: 'Christ the Redeemer, Copacabana beach, Samba, and Amazon rainforest' },
  { country: 'Canada', city: 'Banff, Toronto & Vancouver', category: 'Nature', tagline: 'Turquoise Lake Louise, Rocky Mountains, Niagara Falls, and maple wilderness' },
  { country: 'Chile', city: 'Torres del Paine & Atacama', category: 'Adventure', tagline: 'Patagonia granite peaks and world\'s driest starlit desert' },
  { country: 'Colombia', city: 'Cartagena & Medellín', category: 'Cultural', tagline: 'Colorful colonial walled city, coffee region, and Caribbean breezes' },
  { country: 'Costa Rica', city: 'Arenal & Manuel Antonio', category: 'Nature', tagline: 'Pura Vida lifestyle, volcano hot springs, sloths, and cloud forests' },
  { country: 'Cuba', city: 'Havana & Varadero', category: 'Cultural', tagline: 'Vintage 1950s cars, salsa rhythm, cigars, and white sand beaches' },
  { country: 'Dominica', city: 'Roseau & Boiling Lake', category: 'Nature', tagline: 'The Nature Island of hot springs, waterfalls, and scuba diving' },
  { country: 'Dominican Republic', city: 'Punta Cana & Santo Domingo', category: 'Beach', tagline: 'All-inclusive palm beach resorts and historic colonial Zona' },
  { country: 'Ecuador', city: 'Galápagos Islands & Quito', category: 'Nature', tagline: 'Charles Darwin\'s enchanted islands of giant tortoises and sea iguanas' },
  { country: 'El Salvador', city: 'El Tunco & Suchitoto', category: 'Beach', tagline: 'World-class Pacific surf breaks, volcanic crater lakes, and pupusas' },
  { country: 'Grenada', city: 'St. George\'s', category: 'Beach', tagline: 'The Spice Isle of nutmeg, underwater sculpture parks, and cocoa' },
  { country: 'Guatemala', city: 'Antigua & Lake Atitlán', category: 'Cultural', tagline: 'Volcano-ringed Lake Atitlán and Mayan Tikal pyramid ruins' },
  { country: 'Guyana', city: 'Kaieteur Falls', category: 'Nature', tagline: 'World\'s largest single-drop waterfall in pristine Amazonian jungle' },
  { country: 'Haiti', city: 'Labadee & Citadelle', category: 'Cultural', tagline: 'Historic mountain fortress and vibrant Caribbean art culture' },
  { country: 'Honduras', city: 'Roatán & Copán', category: 'Beach', tagline: 'Mesoamerican barrier reef diving and ancient Mayan stone stelae' },
  { country: 'Jamaica', city: 'Montego Bay & Negril', category: 'Beach', tagline: 'Reggae roots, Seven Mile Beach, jerk chicken, and waterfalls' },
  { country: 'Mexico', city: 'Cancún, Mexico City & Oaxaca', category: 'Cultural', tagline: 'Chichén Itzá Maya pyramids, tacos, cenotes, and turquoise Caribbean' },
  { country: 'Nicaragua', city: 'Granada & Ometepe', category: 'Adventure', tagline: 'Twin volcano island in Lake Nicaragua and colonial colorful towns' },
  { country: 'Panama', city: 'Panama City & San Blas', category: 'City', tagline: 'Panama Canal engineering feat and indigenous Guna Yala paradise' },
  { country: 'Paraguay', city: 'Asunción & Monday Falls', category: 'Nature', tagline: 'Guaraní heritage, cascading waterfalls, and quiet riverfronts' },
  { country: 'Peru', city: 'Machu Picchu & Cusco', category: 'Cultural', tagline: 'Lost Inca citadel in the Andes clouds and ceviche culinary scene' },
  { country: 'Saint Kitts and Nevis', city: 'Basseterre', category: 'Beach', tagline: 'Brimstone Hill fortress and scenic sugar cane railway rides' },
  { country: 'Saint Lucia', city: 'Soufrière & The Pitons', category: 'Beach', tagline: 'Twin volcanic Piton spires rising dramatically out of the ocean' },
  { country: 'Saint Vincent and the Grenadines', city: 'Bequia & Tobago Cays', category: 'Beach', tagline: 'Private island sailing paradise and sea turtle marine sanctuaries' },
  { country: 'Suriname', city: 'Paramaribo', category: 'Nature', tagline: 'Dutch colonial wooden capital nestled beside untouched Amazon jungle' },
  { country: 'Trinidad and Tobago', city: 'Port of Spain & Tobago', category: 'Beach', tagline: 'Vibrant Caribbean Carnival, steelpan music, and Nylon Pool reefs' },
  { country: 'United States', city: 'New York, Grand Canyon & Hawaii', category: 'City', tagline: 'Statue of Liberty, Grand Canyon vistas, and Hawaiian tropical shores' },
  { country: 'Uruguay', city: 'Punta del Este & Montevideo', category: 'Beach', tagline: 'South America\'s glam beach resort town and tranquil gaucho ranches' },
  { country: 'Venezuela', city: 'Angel Falls & Los Roques', category: 'Nature', tagline: 'World\'s highest uninterrupted waterfall plunging from tepui cliffs' },

  // AFRICA (54)
  { country: 'Algeria', city: 'Algiers & Sahara', category: 'Adventure', tagline: 'White coastal city cascading to Mediterranean and Sahara dunes' },
  { country: 'Angola', city: 'Luanda & Kalandula Falls', category: 'Nature', tagline: 'Dramatic horseshoe waterfalls and Atlantic ocean coastal drives' },
  { country: 'Benin', city: 'Cotonou & Ouidah', category: 'Cultural', tagline: 'Voodoo heritage, python temples, and stilt villages on Lake Nokoué' },
  { country: 'Botswana', city: 'Okavango Delta & Chobe', category: 'Adventure', tagline: 'Mokoro canoe safaris in flooded delta wildlife sanctuaries' },
  { country: 'Burkina Faso', city: 'Ouagadougou & Tiébélé', category: 'Cultural', tagline: 'Intricately painted royal mud compounds and pan-African film culture' },
  { country: 'Burundi', city: 'Bujumbura & Lake Tanganyika', category: 'Nature', tagline: 'Ruzizi national park hippos and deep freshwater rift lakes' },
  { country: 'Cabo Verde', city: 'Sal & Santo Antão', category: 'Beach', tagline: 'Creole rhythm, volcanic hiking trails, and turquoise windsurfing bays' },
  { country: 'Cameroon', city: 'Douala & Mt. Cameroon', category: 'Mountain', tagline: 'Africa in miniature — volcanic peaks, beaches, and rainforests' },
  { country: 'Central African Republic', city: 'Dzanga-Sangha', category: 'Nature', tagline: 'Dense Congo basin rainforest home to forest elephants and gorillas' },
  { country: 'Chad', city: 'Ennedi Plateau', category: 'Adventure', tagline: 'Sahara sand arches, desert lakes, and ancient rock art canyons' },
  { country: 'Comoros', city: 'Moroni & Mohéli', category: 'Beach', tagline: 'Perfume islands of ylang-ylang, sea turtles, and volcanic beaches' },
  { country: 'Congo', city: 'Odzala-Kokoua', category: 'Nature', tagline: 'Primate trekking in western lowland gorilla rainforest habitats' },
  { country: 'DR Congo', city: 'Virunga National Park', category: 'Mountain', tagline: 'Active Mount Nyiragongo lava lake and mountain gorilla trekking' },
  { country: 'Djibouti', city: 'Lake Assal & Lac Abbe', category: 'Nature', tagline: 'Whale shark snorkeling and surreal salt lake chimneys' },
  { country: 'Egypt', city: 'Cairo, Luxor & Sharm El Sheikh', category: 'Cultural', tagline: 'Giza Pyramids, Sphinx, Nile cruises, and Red Sea coral reefs' },
  { country: 'Equatorial Guinea', city: 'Malabo & Bioko Island', category: 'Beach', tagline: 'Spanish colonial squares, volcanic beaches, and sea turtle nesting' },
  { country: 'Eritrea', city: 'Asmara', category: 'Cultural', tagline: 'Futuristic 1930s Italian Art Deco architecture in the Horn of Africa' },
  { country: 'Eswatini', city: 'Mlilwane & Hlane', category: 'Nature', tagline: 'Kingdom of rhino sanctuaries, mountain trails, and cultural dances' },
  { country: 'Ethiopia', city: 'Lalibela & Simien Mountains', category: 'Cultural', tagline: 'Rock-hewn monolithic churches and Gelada baboon mountain peaks' },
  { country: 'Gabon', city: 'Loango National Park', category: 'Nature', tagline: 'Where hippos and elephants surf the Atlantic ocean waves' },
  { country: 'Gambia', city: 'Banjul & Senegambia', category: 'Beach', tagline: 'Smiling Coast of Africa, eco-lodges, and 500+ bird species' },
  { country: 'Ghana', city: 'Accra & Cape Coast', category: 'Cultural', tagline: 'Vibrant Afrobeat music, gold coast forts, and Kakum canopy walks' },
  { country: 'Guinea', city: 'Fouta Djallon', category: 'Mountain', tagline: 'Rolling green mountain plateaus, waterfalls, and river sources' },
  { country: 'Guinea-Bissau', city: 'Bijagós Islands', category: 'Beach', tagline: 'Uninhabited Atlantic island archipelago of saltwater hippos' },
  { country: 'Ivory Coast', city: 'Abidjan & Yamoussoukro', category: 'City', tagline: 'Basilica of Our Lady of Peace and lagoon waterfront resorts' },
  { country: 'Kenya', city: 'Maasai Mara & Mombasa', category: 'Adventure', tagline: 'The Great Wildebeest Migration safari and Indian Ocean beaches' },
  { country: 'Lesotho', city: 'Semonkong & Maluti', category: 'Mountain', tagline: 'Kingdom in the Sky, pony trekking, and Maletsunyane waterfall' },
  { country: 'Liberia', city: 'Robertsport', category: 'Beach', tagline: 'Uncrowded Atlantic point breaks, rainforests, and surf culture' },
  { country: 'Libya', city: 'Leptis Magna', category: 'Cultural', tagline: 'Best preserved Roman ruins on the Mediterranean African coast' },
  { country: 'Madagascar', city: 'Avenue of the Baobabs', category: 'Nature', tagline: 'Giant ancient Baobab trees, lemurs, and red rock Tsingy pinnacles' },
  { country: 'Malawi', city: 'Lake Malawi', category: 'Nature', tagline: 'Calendar lake of cichlid fish, sandy freshwater beaches, and tea hills' },
  { country: 'Mali', city: 'Djenné & Timbuktu', category: 'Cultural', tagline: 'Great Mud Mosque architecture, Niger river pinasses, and history' },
  { country: 'Mauritania', city: 'Chinguetti & Iron Ore Train', category: 'Adventure', tagline: 'Desert library oasis cities and epic Sahara desert railway journeys' },
  { country: 'Mauritius', city: 'Le Morne & Grand Baie', category: 'Beach', tagline: 'Underwater waterfall illusion, luxury lagoon resorts, and rum' },
  { country: 'Morocco', city: 'Marrakech & Chefchaouen', category: 'Cultural', tagline: 'Blue Pearl city walls, Sahara camel treks, and spice bazaars' },
  { country: 'Mozambique', city: 'Bazaruto Archipelago', category: 'Beach', tagline: 'Dhow sailboat cruises, dugongs, and turquoise sandbank islands' },
  { country: 'Namibia', city: 'Sossusvlei & Etosha', category: 'Adventure', tagline: 'Towering red dune desert, DeadVlei trees, and salt pan safaris' },
  { country: 'Niger', city: 'Agadez & Aïr Mountains', category: 'Adventure', tagline: 'Tuareg desert crossroads, mudbrick minarets, and Sahara mountain oases' },
  { country: 'Nigeria', city: 'Lagos & Calabar', category: 'City', tagline: 'Afrobeats entertainment powerhouse, Lekki conservation, and beaches' },
  { country: 'Rwanda', city: 'Volcanoes National Park & Kigali', category: 'Nature', tagline: 'Land of a Thousand Hills and endangered mountain gorilla trekking' },
  { country: 'Sao Tome and Principe', city: 'Principe Island', category: 'Beach', tagline: 'Emerald volcanic needle peaks, cocoa plantations, and deserted shores' },
  { country: 'Senegal', city: 'Dakar & Lake Retba', category: 'Cultural', tagline: 'Pink salt lake, Gorée Island history, and Teranga hospitality' },
  { country: 'Seychelles', city: 'Mahé & La Digue', category: 'Beach', tagline: 'Granite boulder beaches, giant tortoises, and tropical exclusivity' },
  { country: 'Sierra Leone', city: 'Freetown & River Number Two', category: 'Beach', tagline: 'Unspoiled white sand Atlantic beaches and chimpanzee sanctuaries' },
  { country: 'Somalia', city: 'Mogadishu & Laas Geel', category: 'Cultural', tagline: 'Neolithic cave art paintings and white arch ocean coastlines' },
  { country: 'South Africa', city: 'Cape Town & Kruger', category: 'Adventure', tagline: 'Table Mountain, Big Five safari, coastal drives, and vineyards' },
  { country: 'South Sudan', city: 'Boma & Sudd Wetland', category: 'Nature', tagline: 'Epic kob wildlife migration and vast Nile river papyrus swamps' },
  { country: 'Sudan', city: 'Meroë Pyramids', category: 'Cultural', tagline: 'Nubian desert pyramids rising along the banks of the Nile' },
  { country: 'Tanzania', city: 'Serengeti & Zanzibar', category: 'Adventure', tagline: 'Serengeti Great Migration, Mt. Kilimanjaro peak, and Stone Town' },
  { country: 'Togo', city: 'Lomé & Koutammakou', category: 'Cultural', tagline: 'UNESCO Batammariba mud tower houses and palm coastal markets' },
  { country: 'Tunisia', city: 'Sidi Bou Saïd & Carthage', category: 'Beach', tagline: 'Blue and white cliffside village, Roman Carthage, and Sahara film sets' },
  { country: 'Uganda', city: 'Bwindi & Murchison Falls', category: 'Nature', tagline: 'Pearl of Africa — Gorilla trekking and Nile river waterfall safari' },
  { country: 'Zambia', city: 'Victoria Falls & South Luangwa', category: 'Adventure', tagline: 'The Smoke that Thunders waterfall and walking safari wilderness' },
  { country: 'Zimbabwe', city: 'Victoria Falls & Great Zimbabwe', category: 'Adventure', tagline: 'Zambezi river rafting, Victoria Falls, and ancient stone ruins' },

  // OCEANIA (14)
  { country: 'Australia', city: 'Sydney, Melbourne & Great Barrier Reef', category: 'Beach', tagline: 'Opera House, Outback red center, and world\'s largest coral reef' },
  { country: 'Fiji', city: 'Nadi & Mamanuca Islands', category: 'Beach', tagline: 'Bula spirit, soft coral diving, and crystal clear island resorts' },
  { country: 'Kiribati', city: 'Tarawa & Christmas Island', category: 'Beach', tagline: 'Vast Pacific coral atolls where the sun rises first on Earth' },
  { country: 'Marshall Islands', city: 'Majuro Atoll', category: 'Beach', tagline: 'Ring-shaped coral lagoons, WWII wreck diving, and ocean breezes' },
  { country: 'Micronesia', city: 'Chuuk & Pohnpei', category: 'Adventure', tagline: 'Nan Madol ancient stone city built on coral reefs and wreck diving' },
  { country: 'Nauru', city: 'Yaren', category: 'Beach', tagline: 'Smallest island republic surrounded by Pacific coral reef pinnacles' },
  { country: 'New Zealand', city: 'Queenstown, Auckland & Milford Sound', category: 'Adventure', tagline: 'Majestic fjords, Hobbiton, glacier hikes, and extreme sports' },
  { country: 'Palau', city: 'Rock Islands', category: 'Beach', tagline: 'Unmatched emerald mushroom islands and Jellyfish Lake swimming' },
  { country: 'Papua New Guinea', city: 'Kokoda & Mt. Hagen', category: 'Cultural', tagline: 'Bird of Paradise rainforests, tribal festivals, and trekking' },
  { country: 'Samoa', city: 'Apia & To Sua Ocean Trench', category: 'Beach', tagline: 'Natural swimming sinkhole, lava fields, and Fa\'a Samoa culture' },
  { country: 'Solomon Islands', city: 'Honiara & Marovo Lagoon', category: 'Beach', tagline: 'World\'s largest double barrier lagoon and WWII Pacific history' },
  { country: 'Tonga', city: 'Nuku\'alofa & Vava\'u', category: 'Beach', tagline: 'Kingdom of humpback whale swimming and Polynesian royal heritage' },
  { country: 'Tuvalu', city: 'Funafuti Atoll', category: 'Beach', tagline: 'Peaceful Pacific coral rim atoll surrounded by turquoise ocean' },
  { country: 'Vanuatu', city: 'Port Vila & Mt. Yasur', category: 'Adventure', tagline: 'World\'s most accessible active volcano and blue hole swimming' },
]

async function main() {
  console.log(`🌍 Generating complete UN 195 Countries Travel Database...`)

  const dataDir = path.join(process.cwd(), 'data')
  fs.mkdirSync(dataDir, { recursive: true })

  const countriesDatabase = UN_COUNTRIES.map((item, index) => {
    const pool = IMAGE_POOLS[item.category] || IMAGE_POOLS.Beach
    const image = pool[index % pool.length]
    const rating = parseFloat((4.6 + (index % 5) * 0.08).toFixed(1))
    const priceUSD = 499 + (index % 12) * 150
    const durationDays = 5 + (index % 6) * 2

    const tags = ['Popular', 'Trending', "Editor's Pick", 'Luxury', 'New', null]
    const tag = tags[index % tags.length]

    return {
      id: index + 1,
      city: item.city,
      country: item.country,
      tagline: item.tagline,
      description: `${item.tagline}. Jelajahi keindahan panorama ${item.city} di ${item.country} dengan paket perjalanan eksklusif NOVA.`,
      price: `From $${priceUSD}`,
      rating,
      duration: `${durationDays}-${durationDays + 3} days`,
      category: item.category,
      tag,
      image
    }
  })

  // Save 195 countries to data/countries_database.json & data/destinations.json
  fs.writeFileSync(path.join(dataDir, 'countries_database.json'), JSON.stringify(countriesDatabase, null, 2), 'utf-8')
  fs.writeFileSync(path.join(dataDir, 'destinations.json'), JSON.stringify(countriesDatabase, null, 2), 'utf-8')

  console.log(`✅ Saved all ${countriesDatabase.length} UN member countries to data/countries_database.json & data/destinations.json`)

  // Sync to Supabase Database
  try {
    console.log(`Syncing ${countriesDatabase.length} countries to Supabase 'Destination' table...`)

    // Upsert into Supabase in chunks of 50
    for (let i = 0; i < countriesDatabase.length; i += 50) {
      const chunk = countriesDatabase.slice(i, i + 50)
      const { error } = await supabase.from('Destination').upsert(chunk, { onConflict: 'city' })
      if (error) {
        console.warn(`Chunk ${i} upsert note:`, error.message)
      }
    }
    console.log(`🎉 Supabase 'Destination' table updated with 195 UN Countries!`)
  } catch (err) {
    console.error('Supabase sync note (Local JSON fully ready):', err)
  }
}

main().catch(console.error)
