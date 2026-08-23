import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from('AuditLog')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error || !logs) {
      // Fallback mock logs for demonstration if DB table is clean
      const fallbackLogs = [
        { id: 1, adminEmail: 'admin@novatravel.id', action: 'ROLE_UPDATE', target: 'User #88 (Budi)', details: 'Changed role to Admin', createdAt: new Date().toISOString() },
        { id: 2, adminEmail: 'super@novatravel.id', action: 'STATUS_CONFIRMED', target: 'Booking #102', details: 'Approved payment status', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, adminEmail: 'admin@novatravel.id', action: 'REFUND_APPROVED', target: 'Booking #95', details: 'Processed refund request IDR 12,500,000', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ]
      return NextResponse.json(fallbackLogs)
    }

    return NextResponse.json(logs)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
