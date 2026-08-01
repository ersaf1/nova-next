export interface Attraction {
  name: string
  description: string
  image: string
  lat?: number   // from Geoapify
  lon?: number   // from Geoapify
}

export const DESTINATION_ATTRACTIONS: Record<string, Attraction[]> = {
  bali: [
    { name: 'Ubud Rice Terraces (Tegalalang)', description: 'Stunning terraced hillside rice paddies offering scenic valley views and walking paths.', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=85' },
    { name: 'Uluwatu Temple', description: 'Clifftop sea temple offering spectacular sunset views over the Indian Ocean.', image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200&q=85' },
    { name: 'Tanah Lot', description: 'An iconic ancient Hindu temple perched on a rock formation amidst crashing waves.', image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=1200&q=85' },
    { name: 'Kelingking Beach', description: 'Famous T-Rex-shaped cliff overlooking pristine white sand and turquoise waters in Nusa Penida.', image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&q=85' },
  ],
  tokyo: [
    { name: 'Shibuya Crossing', description: 'The world\'s busiest pedestrian intersection, a symbol of Tokyo\'s modern energy.', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=85' },
    { name: 'Senso-ji Temple', description: 'Tokyo\'s oldest and most iconic Buddhist temple, located in the historic Asakusa district.', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=85' },
    { name: 'Tokyo Tower', description: 'Eiffel Tower-inspired communications and observation tower offering beautiful city views.', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&q=85' },
    { name: 'Mount Fuji Panoramic View', description: 'Breathtaking snow-capped peaks visible from the city on clear days.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85' },
  ],
  paris: [
    { name: 'Eiffel Tower', description: 'The timeless symbol of Paris, offering panoramic views of the city skyline.', image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&q=85' },
    { name: 'Louvre Museum', description: 'The world\'s largest art museum, home to the Mona Lisa and thousands of historic treasures.', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=85' },
    { name: 'Notre-Dame Cathedral', description: 'A masterpiece of French Gothic architecture located on the Île de la Cité.', image: 'https://images.unsplash.com/photo-1478358161113-b0e11994a36b?w=1200&q=85' },
    { name: 'Arc de Triomphe', description: 'A monumental arch at the western end of the Champs-Élysées, honoring historic victories.', image: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=1200&q=85' },
  ],
  santorini: [
    { name: 'Oia Sunset Cliffs', description: 'Picturesque village famous for its dramatic sunsets over the Aegean Sea.', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85' },
    { name: 'Blue Dome Churches', description: 'Traditional white-washed buildings with vibrant blue domes overlooking the caldera.', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&q=85' },
    { name: 'Amoudi Bay', description: 'A charming port below Oia known for its red cliffs, clear water, and fresh seafood.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85' },
  ],
  rome: [
    { name: 'The Colosseum', description: 'The iconic ancient amphitheater, standing as a monument to Imperial Rome.', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=85' },
    { name: 'Trevi Fountain', description: 'A stunning Baroque fountain where visitors toss coins to ensure their return to Rome.', image: 'https://images.unsplash.com/photo-1525874684015-5837e263121c?w=1200&q=85' },
    { name: 'Roman Forum', description: 'The ancient plaza surrounded by the ruins of several important government buildings.', image: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=85' },
  ],
  newyork: [
    { name: 'Times Square', description: 'The neon-lit commercial intersection known as the heart of Broadway.', image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=85' },
    { name: 'Central Park', description: 'A massive urban oasis featuring lakes, pathways, and beautiful seasonal foliage.', image: 'https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?w=1200&q=85' },
    { name: 'Statue of Liberty', description: 'The colossal neoclassical sculpture on Liberty Island in New York Harbor.', image: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=1200&q=85' },
  ],
  kyoto: [
    { name: 'Fushimi Inari Shrine', description: 'Shinto shrine famous for its path of thousands of vibrant orange torii gates.', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=85' },
    { name: 'Kinkaku-ji (Golden Pavilion)', description: 'Zen Buddhist temple whose top two floors are completely covered in gold leaf.', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1200&q=85' },
    { name: 'Arashiyama Bamboo Grove', description: 'A magical natural forest of towering bamboo stalks with a winding walking trail.', image: 'https://images.unsplash.com/photo-1576675466969-38eeae4b41f6?w=1200&q=85' },
  ],
}

const GENERAL_TRAVEL_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=85',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=85'
]

export function getAttractionsForDestination(destination: string, apiAttractions?: { name: string; description: string }[]): Attraction[] {
  const norm = destination.toLowerCase().trim().replace(/[^a-z0-9]/g, '')

  if (DESTINATION_ATTRACTIONS[norm]) {
    return DESTINATION_ATTRACTIONS[norm]
  }

  if (apiAttractions && apiAttractions.length > 0) {
    return apiAttractions.map((attr, idx) => ({
      name: attr.name,
      description: attr.description,
      image: GENERAL_TRAVEL_PHOTOS[idx % GENERAL_TRAVEL_PHOTOS.length]
    }))
  }

  return [
    { name: 'Scenic Landmarks', description: 'Explore the local architecture, historic squares, and iconic neighborhood views.', image: GENERAL_TRAVEL_PHOTOS[0] },
    { name: 'Nature & Parks', description: 'Relax in local green spaces, scenic view points, and beautiful natural areas.', image: GENERAL_TRAVEL_PHOTOS[1] },
    { name: 'Local Food & Cafes', description: 'Experience the local culinary scene, street food markets, and cozy cafes.', image: GENERAL_TRAVEL_PHOTOS[2] },
  ]
}

// ─── Geoapify integration ────────────────────────────────────
import type { GeoapifyPlace } from './geoapify/types'

function formatCategory(category: string): string {
  const last = category.split('.').pop() ?? category
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/_/g, ' ')
}

// Converts Geoapify places into the Attraction shape used by the itinerary UI.
// Geoapify places have no photos — GENERAL_TRAVEL_PHOTOS used as visual fallback.
export function mergePlacesIntoAttractions(places: GeoapifyPlace[]): Attraction[] {
  return places.map((place, idx) => ({
    name: place.name,
    description: [
      place.categories[0] ? formatCategory(place.categories[0]) : 'Attraction',
      place.address,
      place.openingHours ? `Buka: ${place.openingHours}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
    image: GENERAL_TRAVEL_PHOTOS[idx % GENERAL_TRAVEL_PHOTOS.length],
    lat: place.lat,
    lon: place.lon,
  }))
}