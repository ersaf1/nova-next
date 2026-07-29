import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'
  const staticRoutes = ['/', '/destinations', '/packages', '/search', '/how-it-works']
  const { data: destinations } = await supabase.from('Destination').select('id')
  const { data: packages } = await supabase.from('Package').select('id, slug')
  return [
    ...staticRoutes.map(route => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1 : 0.8,
    })),
    ...(destinations ?? []).map((d: { id: number }) => ({
      url: `${baseUrl}/destinations/${d.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...(packages ?? []).map((p: { id: number; slug?: string }) => ({
      url: `${baseUrl}/packages/${p.slug ?? p.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]
}
