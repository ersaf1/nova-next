// Maps natural language (Indonesian + English) to Geoapify category strings.
// Add new mappings here as needed — no other files need to change.

const CATEGORY_MAP: Record<string, string> = {
  // Coffee & drinks
  'coffee shop': 'catering.cafe',
  'cafe': 'catering.cafe',
  'kafe': 'catering.cafe',
  'tempat ngopi': 'catering.cafe',
  'ngopi': 'catering.cafe',
  'kedai kopi': 'catering.cafe',
  'coffee': 'catering.cafe',

  // Food
  'restaurant': 'catering.restaurant',
  'restoran': 'catering.restaurant',
  'rumah makan': 'catering.restaurant',
  'makan': 'catering.restaurant',
  'food': 'catering.restaurant',
  'kuliner': 'catering.restaurant',
  'warung': 'catering.fast_food',
  'fast food': 'catering.fast_food',

  // Accommodation
  'hotel': 'accommodation.hotel',
  'penginapan': 'accommodation',
  'inn': 'accommodation',
  'hostel': 'accommodation.hostel',
  'villa': 'accommodation',
  'resort': 'accommodation',
  'bnb': 'accommodation.bed_and_breakfast',

  // Shopping
  'mall': 'commercial.shopping_mall',
  'pusat perbelanjaan': 'commercial.shopping_mall',
  'shopping': 'commercial.shopping_mall',
  'supermarket': 'commercial.supermarket',
  'minimarket': 'commercial.convenience',
  'toko': 'commercial',

  // Tourism & attractions
  'tempat wisata': 'tourism',
  'wisata': 'tourism',
  'attraction': 'tourism',
  'tourist': 'tourism',
  'museum': 'entertainment.museum',
  'taman': 'leisure.park',
  'park': 'leisure.park',
  'pantai': 'natural.beach',
  'beach': 'natural.beach',
  'gunung': 'natural.mountain',
  'mountain': 'natural.mountain',

  // Entertainment
  'hiburan': 'entertainment',
  'bioskop': 'entertainment.cinema',
  'cinema': 'entertainment.cinema',
  'theater': 'entertainment.culture.theatre',
  'galeri': 'entertainment.culture.gallery',
  'gallery': 'entertainment.culture.gallery',
  'zoo': 'entertainment.zoo',
  'kebun binatang': 'entertainment.zoo',
  'aquarium': 'entertainment.aquarium',

  // Health
  'rumah sakit': 'healthcare.hospital',
  'hospital': 'healthcare.hospital',
  'klinik': 'healthcare.clinic',
  'apotek': 'healthcare.pharmacy',
  'pharmacy': 'healthcare.pharmacy',

  // Transport & services
  'atm': 'service.financial.atm',
  'bank': 'service.financial.bank',
  'spbu': 'service.fuel',
  'gas station': 'service.fuel',
  'parkir': 'parking',
}

const DEFAULT_CATEGORY = 'tourism'

export function mapToGeoapifyCategory(input: string): string {
  const normalized = input.toLowerCase().trim()

  // Exact match first
  if (CATEGORY_MAP[normalized]) return CATEGORY_MAP[normalized]

  // Partial match (input contains a keyword)
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (normalized.includes(keyword) || keyword.includes(normalized)) {
      return category
    }
  }

  // If input already looks like a Geoapify category (contains dots), return as-is
  if (normalized.includes('.')) return normalized

  return DEFAULT_CATEGORY
}

export { CATEGORY_MAP }
