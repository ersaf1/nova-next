import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nova-travel.vercel.app'
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/api', '/login'] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
