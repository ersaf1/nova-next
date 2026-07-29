import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    letterSpacing: 4,
  },
  ticketBadge: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    padding: '6 12',
    borderRadius: 4,
    letterSpacing: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    width: 140,
  },
  value: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 'bold',
    flex: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 16,
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '4 10',
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  totalSection: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    color: '#6366f1',
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 9,
    color: '#d1d5db',
    textAlign: 'center',
    fontFamily: 'Courier',
  },
})

export type EticketBooking = {
  id: number
  name: string
  email: string
  phone?: string
  packageName: string
  country: string
  travelDate: string
  participants: number
  totalAmount: number
  status: string
  midtrans_order_id?: string
  created_at: string
}

type EticketProps = {
  booking: EticketBooking
}

export default function EticketPDF({ booking }: EticketProps) {
  const formattedDate = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : booking.travelDate

  const formattedAmount = `Rp ${booking.totalAmount.toLocaleString('id-ID')}`
  const bookedAt = new Date(booking.created_at).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>NOVA</Text>
          <Text style={styles.ticketBadge}>E-TICKET</Text>
        </View>

        {/* Passenger Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Penumpang</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{booking.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{booking.email}</Text>
          </View>
          {booking.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Nomor HP</Text>
              <Text style={styles.value}>{booking.phone}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Trip Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detail Perjalanan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Paket Wisata</Text>
            <Text style={styles.value}>{booking.packageName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Destinasi</Text>
            <Text style={styles.value}>{booking.country}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal Perjalanan</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Jumlah Peserta</Text>
            <Text style={styles.value}>{booking.participants} orang</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Payment Info */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalValue}>{formattedAmount}</Text>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.statusBadge}>{booking.status.toUpperCase()}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tunjukkan tiket ini kepada pemandu wisata NOVA Travel
          </Text>
          <Text style={styles.footerText}>Dipesan pada {bookedAt}</Text>
          {booking.midtrans_order_id && (
            <Text style={styles.bookingId}>
              Order ID: {booking.midtrans_order_id}
            </Text>
          )}
          <Text style={styles.bookingId}>Booking ID: #{booking.id}</Text>
        </View>
      </Page>
    </Document>
  )
}
