'use client'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/supabase-client'

interface BookingUpdate {
  id: number | string
  status: string
  refund_status?: string | null
  updated_at?: string
}

export function useBookingRealtime(bookingId: string | number | null) {
  const [status, setStatus] = useState<string | null>(null)
  const [refundStatus, setRefundStatus] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    if (!bookingId) return

    const channel = supabaseClient
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Booking',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          const newData = payload.new as BookingUpdate
          if (newData.status) setStatus(newData.status)
          if (newData.refund_status !== undefined) setRefundStatus(newData.refund_status ?? null)
          setLastUpdate(new Date())
        }
      )
      .subscribe()

    return () => {
      supabaseClient.removeChannel(channel)
    }
  }, [bookingId])

  return { status, refundStatus, lastUpdate }
}
