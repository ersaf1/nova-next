import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // 1. Fetch profiles table if available
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')

    // 2. Fetch all bookings to aggregate spend and activity
    const { data: bookings } = await supabase
      .from('Booking')
      .select('*')

    const bookingList = Array.isArray(bookings) ? bookings : []
    const profileList = Array.isArray(profiles) ? profiles : []

    // Combine profiles and unique emails from bookings
    const emailMap = new Map<string, any>()

    // Process profiles
    profileList.forEach(p => {
      if (p.email) {
        emailMap.set(p.email.toLowerCase(), {
          id: p.id || p.user_id,
          email: p.email,
          name: p.full_name || p.name || p.email.split('@')[0],
          role: p.role || 'user',
          createdAt: p.created_at || new Date().toISOString(),
          phone: p.phone || '-',
          totalBookings: 0,
          totalSpent: 0,
          bookings: []
        })
      }
    })

    // Aggregate booking data into user accounts
    bookingList.forEach(b => {
      const email = b.email ? b.email.toLowerCase() : null
      if (!email) return

      if (!emailMap.has(email)) {
        emailMap.set(email, {
          id: b.userId || `user-${Math.random().toString(36).substr(2, 9)}`,
          email: b.email,
          name: b.name || b.email.split('@')[0],
          role: 'user',
          createdAt: b.createdAt || new Date().toISOString(),
          phone: b.phone || '-',
          totalBookings: 0,
          totalSpent: 0,
          bookings: []
        })
      }

      const userRecord = emailMap.get(email)
      userRecord.totalBookings += 1
      userRecord.bookings.push({
        id: b.id,
        packageName: b.packageName,
        travelDate: b.travelDate || b.departureStartDate,
        participants: b.participants,
        status: b.status || b.bookingStatus,
        totalAmount: b.totalAmount || (b.participants * 12500000),
        createdAt: b.createdAt
      })

      if (b.status === 'confirmed' || b.bookingStatus === 'confirmed') {
        const amount = b.totalAmount || (b.participants * 12500000)
        userRecord.totalSpent += amount
      }
    })

    const users = Array.from(emailMap.values())

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
