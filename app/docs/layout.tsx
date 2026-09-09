import type { Metadata } from 'next'
import DocsLayoutWrapper from '@/components/docs/DocsLayoutWrapper'

export const metadata: Metadata = {
  title: 'NOVA Travel — Digital User Guide & Interactive Application Showcase',
  description: 'Buku panduan visual interaktif lengkap untuk seluruh halaman, fitur, alur, dan fungsi aplikasi Nova Travel.',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DocsLayoutWrapper>{children}</DocsLayoutWrapper>
}
