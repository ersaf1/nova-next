import type { Tool } from '@google/generative-ai'

// Gemini function declarations for the AI travel agent.
// These tell Gemini what tools it can call — it never invents place data.
export const AGENT_TOOLS: Tool[] = [
  {
    functionDeclarations: [
      {
        name: 'geocode_location',
        description:
          'Convert a location name, address, or landmark to geographic coordinates (lat/lon). Use this before searching for places near a location.',
        parameters: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: 'OBJECT' as any,
          properties: {
            text: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: 'STRING' as any,
              description:
                'The location name or address to geocode, e.g. "Artos Mall Magelang" or "Jakarta Pusat"',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'search_places',
        description:
          'Search for real places (cafes, restaurants, hotels, attractions, etc.) near a geographic location. Always geocode first to get coordinates.',
        parameters: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: 'OBJECT' as any,
          properties: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            latitude: { type: 'NUMBER' as any, description: 'Latitude of the center point' },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            longitude: { type: 'NUMBER' as any, description: 'Longitude of the center point' },
            category: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: 'STRING' as any,
              description:
                'Type of place to search. Use natural language like "cafe", "hotel", "restaurant", or Geoapify categories like "catering.cafe"',
            },
            radius: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: 'NUMBER' as any,
              description: 'Search radius in meters. Default 5000.',
            },
            limit: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: 'NUMBER' as any,
              description: 'Max results to return. Default 10, max 20.',
            },
            location_name: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type: 'STRING' as any,
              description:
                'Human-readable name of the reference location, used for display',
            },
          },
          required: ['latitude', 'longitude', 'category'],
        },
      },
    ],
  },
]
