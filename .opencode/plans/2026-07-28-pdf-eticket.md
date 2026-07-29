# PLAN 7: PDF E-ticket Download
**File:** 2026-07-28-pdf-eticket.md
**Date:** 2026-07-28

## Goal
Allow users to download their booking confirmation as a PDF e-ticket.

## Approach
Use `@react-pdf/renderer` to generate PDF client-side. This avoids server-side PDF generation complexity.

## New Files
- `components/EticketPDF.tsx` — PDF document component using @react-pdf/renderer
- `app/api/bookings/[id]/ticket/route.ts` — GET, verify booking exists and user owns it, return booking data

## Modified Files
- `app/payment/confirmation/[bookingId]/page.tsx` — add "Download Tiket PDF" button

## Dependencies
```bash
npm install @react-pdf/renderer
npm install --save-dev @types/react-pdf
```

---

## Tasks

### Task 1 — Install @react-pdf/renderer
Run: `npm install @react-pdf/renderer`

### Task 2 — EticketPDF component
`components/EticketPDF.tsx` using `Document`, `Page`, `Text`, `View`, `StyleSheet` from `@react-pdf/renderer`:
- Header: NOVA logo text, "E-TICKET" title
- Booking ID, Order ID (midtrans_order_id)
- Passenger: name, email, phone
- Trip details: packageName, country, travelDate, participants
- Amount: totalAmount formatted as IDR
- Status badge
- Footer: "Tunjukkan tiket ini kepada pemandu wisata"
- Style: clean white background, indigo accent color (#6366f1)

### Task 3 — Add download button to confirmation page
In `app/payment/confirmation/[bookingId]/page.tsx`:
- Import `PDFDownloadLink` from `@react-pdf/renderer`
- Import `EticketPDF` component
- Add button: "Download Tiket PDF" with Download icon (lucide-react)
- `PDFDownloadLink` wraps button, filename: `nova-ticket-{bookingId}.pdf`
- Note: `PDFDownloadLink` is client-only, needs dynamic import with `ssr: false`
