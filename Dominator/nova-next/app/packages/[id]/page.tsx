import { redirect, notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const packageId = parseInt(id)
  if (isNaN(packageId)) notFound()

  const { data } = await supabase
    .from('Package')
    .select('slug')
    .eq('id', packageId)
    .single()

  if (data?.slug) {
    redirect(`/packages/${data.slug}`)
  }

  // No slug yet — show not found
  notFound()
}
