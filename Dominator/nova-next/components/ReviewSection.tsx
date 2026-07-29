'use client'

import { useState } from 'react'
import ReviewList from './ReviewList'
import ReviewForm from './ReviewForm'

interface ReviewSectionProps {
  entityType: 'destination' | 'package'
  entityId: number
}

export default function ReviewSection({ entityType, entityId }: ReviewSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Ulasan</h2>
      <ReviewList entityType={entityType} entityId={entityId} refreshKey={refreshKey} />
      <ReviewForm
        entityType={entityType}
        entityId={entityId}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </section>
  )
}
