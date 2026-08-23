import { supabase } from '@/lib/supabase'

export interface AuditLogEntry {
  id?: number
  adminEmail: string
  action: string // e.g. 'ROLE_UPDATE', 'STATUS_CONFIRMED', 'REFUND_APPROVED', 'PRICE_UPDATE'
  target: string // e.g. 'User #12', 'Booking #104'
  details?: string
  createdAt?: string
}

export async function logAdminAction(entry: AuditLogEntry): Promise<boolean> {
  const logData = {
    adminEmail: entry.adminEmail || 'admin@novatravel.id',
    action: entry.action,
    target: entry.target,
    details: entry.details || '',
    createdAt: new Date().toISOString()
  }

  console.log('[Admin Audit Log]:', logData)

  try {
    const { error } = await supabase
      .from('AuditLog')
      .insert(logData)

    if (error) {
      // fallback to memory/console if table doesn't exist
      console.warn('AuditLog table insert fallback:', error.message)
    }
    return true
  } catch {
    return false
  }
}
