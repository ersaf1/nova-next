// ============================================================
// NOVA — Shared Types
// Single source of truth for all entities across UI, API, DB
// ============================================================

// ─── Destination ────────────────────────────────────────────
export interface Destination {
  id: number
  // New canonical fields
  name?: string              // backfilled from city
  slug?: string              // URL-safe identifier
  // Legacy / existing fields kept for compat
  city: string
  country: string
  description?: string
  image: string
  tag?: string
  rating?: number
  price?: string
  latitude?: number
  longitude?: number
  createdAt?: string
  updatedAt?: string
}

// ─── Travel Package ─────────────────────────────────────────
export interface TravelPackage {
  id: number
  // New canonical fields
  slug?: string              // URL-safe identifier (backfilled from title)
  destinationId?: number     // FK to Destination
  shortDescription?: string  // 1-2 sentences
  description?: string       // full rich text
  durationDays?: number      // e.g. 8
  durationNights?: number    // e.g. 7
  coverImage?: string        // primary hero image (backfilled from image)
  gallery?: string[]         // additional images
  excluded?: string[]        // what's NOT included
  status?: 'draft' | 'published' | 'archived'

  // Legacy / existing fields kept for compat
  tag: string
  tagColor: string
  title: string
  subtitle?: string
  image?: string             // legacy, use coverImage for new code
  price: number              // base price in IDR
  originalPrice?: number     // original price in IDR (for discount display)
  duration?: string          // e.g. "7 Days / 6 Nights" (legacy string form)
  groupSize?: string         // e.g. "2-12 people"
  rating: number
  reviews?: number           // review count (legacy name)
  reviewCount?: number       // review count (new name)
  includes?: string[]        // what's included
  highlight?: string         // short highlight text
  category?: string          // destination/category grouping
  createdAt?: string
  updatedAt?: string
}

// ─── Traveler ───────────────────────────────────────────────
export interface Traveler {
  id?: string
  bookingId?: number
  fullName: string
  gender?: string
  birthDate?: string
  nationality?: string
  passportNumber?: string
  passportExpiry?: string
}

// ─── Package Departure ──────────────────────────────────────
export interface PackageDeparture {
  id: number
  packageId: number
  startDate: string      // ISO date string YYYY-MM-DD
  endDate: string        // ISO date string YYYY-MM-DD
  capacity: number
  remainingSlots: number
  price: number          // price per person in IDR
  status: 'available' | 'limited' | 'sold_out' | 'cancelled'
  createdAt?: string
  updatedAt?: string
}

// ─── Booking ────────────────────────────────────────────────
export interface Booking {
  id: number
  bookingCode?: string
  userId?: string

  packageId: number
  packageName: string     // snapshot at booking time
  departureId?: number

  // departure snapshot
  departureStartDate?: string
  departureEndDate?: string

  contactName: string
  contactEmail: string
  contactPhone: string

  participants: number

  unitPrice: number       // IDR per person (snapshot)
  subtotal: number        // unitPrice * participants
  discountAmount: number  // IDR
  serviceFee?: number     // IDR, default 250000
  totalAmount: number     // final IDR

  promoCode?: string
  voucherCode?: string
  notes?: string

  bookingStatus: 'draft' | 'pending' | 'pending_payment' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'expired' | 'refunded'

  // Midtrans fields
  midtrans_order_id?: string
  midtrans_transaction_id?: string
  midtrans_payment_method?: string
  paid_at?: string

  // legacy fields kept for backward compat
  country?: string
  travelDate?: string
  name?: string           // legacy contactName
  email?: string          // legacy contactEmail
  phone?: string          // legacy contactPhone
  status?: string         // legacy bookingStatus

  // Refund fields
  refund_status?: 'none' | 'requested' | 'approved' | 'rejected'
  refund_reason?: string
  refunded_at?: string

  createdAt?: string
  updatedAt?: string
}

// ─── PromoCode ──────────────────────────────────────────────
export interface PromoCode {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minimumPurchase?: number
  maximumDiscount?: number
  startDate: string
  endDate: string
  usageLimit?: number
  usagePerUser?: number
  active: boolean
}

// ─── SavedItinerary ─────────────────────────────────────────
export interface SavedItinerary {
  id: string
  userId: string
  title: string
  destination: string
  duration: number
  travelers: number
  budget?: number
  preferences: string[]
  generatedContent: unknown
  visibility: 'private' | 'shared'
  shareToken?: string
  createdAt: string
  updatedAt: string
}

// ─── API Response wrapper ────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    fields?: Record<string, string>
  }
}

// ─── Booking Form State ──────────────────────────────────────
export interface BookingFormData {
  name: string
  email: string
  phone: string
  participants: number
  notes: string
}

// ─── Form Errors ─────────────────────────────────────────────
export interface BookingFormErrors {
  name?: string
  email?: string
  phone?: string
  participants?: string
}

// ─── Voucher Validation Response ─────────────────────────────
export interface VoucherValidationResult {
  valid: boolean
  message?: string
  code?: string
  discount_type?: string
  discount_value?: number
  discount_amount?: number
  discounted_amount?: number
}

// ─── Utility: IDR formatter ──────────────────────────────────
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Utility: departure status label ─────────────────────────
export function getDepartureStatusLabel(status: PackageDeparture['status']): string {
  switch (status) {
    case 'available': return 'Tersedia'
    case 'limited': return 'Slot Terbatas'
    case 'sold_out': return 'Habis Terjual'
    case 'cancelled': return 'Dibatalkan'
  }
}

// ─── Utility: departure status color ─────────────────────────
export function getDepartureStatusColor(status: PackageDeparture['status']): string {
  switch (status) {
    case 'available': return 'text-emerald-600 bg-emerald-50'
    case 'limited': return 'text-amber-600 bg-amber-50'
    case 'sold_out': return 'text-red-500 bg-red-50'
    case 'cancelled': return 'text-neutral-400 bg-neutral-100'
  }
}

// ─── Utility: booking status label ───────────────────────────
export function getBookingStatusLabel(status: Booking['bookingStatus']): string {
  switch (status) {
    case 'draft': return 'Draft'
    case 'pending': return 'Menunggu'
    case 'pending_payment': return 'Menunggu Pembayaran'
    case 'confirmed': return 'Dikonfirmasi'
    case 'cancelled': return 'Dibatalkan'
    case 'completed': return 'Selesai'
  }
}

// ─── Utility: booking status color ───────────────────────────
export function getBookingStatusColor(status: Booking['bookingStatus']): string {
  switch (status) {
    case 'draft': return 'text-neutral-500 bg-neutral-100'
    case 'pending': return 'text-amber-600 bg-amber-50'
    case 'pending_payment': return 'text-amber-600 bg-amber-50'
    case 'confirmed': return 'text-emerald-600 bg-emerald-50'
    case 'cancelled': return 'text-red-500 bg-red-50'
    case 'completed': return 'text-blue-600 bg-blue-50'
  }
}

// ─── Utility: payment status label ───────────────────────────
export function getPaymentStatusLabel(status: Booking['paymentStatus']): string {
  switch (status) {
    case 'unpaid': return 'Belum Dibayar'
    case 'pending': return 'Menunggu'
    case 'paid': return 'Lunas'
    case 'failed': return 'Gagal'
    case 'expired': return 'Kadaluarsa'
    case 'refunded': return 'Dikembalikan'
  }
}

// ─── Utility: payment status color ───────────────────────────
export function getPaymentStatusColor(status: Booking['paymentStatus']): string {
  switch (status) {
    case 'unpaid': return 'text-red-500 bg-red-50'
    case 'pending': return 'text-amber-600 bg-amber-50'
    case 'paid': return 'text-emerald-600 bg-emerald-50'
    case 'failed': return 'text-red-500 bg-red-50'
    case 'expired': return 'text-neutral-400 bg-neutral-100'
    case 'refunded': return 'text-blue-600 bg-blue-50'
  }
}

// ─── Utility: package slug or ID fallback ────────────────────
export function packageHref(pkg: { slug?: string; id: number }): string {
  return `/packages/${pkg.slug ?? pkg.id}`
}
