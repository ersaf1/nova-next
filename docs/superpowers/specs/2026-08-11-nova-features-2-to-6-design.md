# NOVA Travel Advanced Features 2-6 Specification

**Date:** 2026-08-11  
**Project:** NOVA Travel (Next.js App)  
**Location:** `Dominator/nova-next/`

---

## 1. Executive Summary

Implement 5 advanced enterprise features (Features 2 through 6) into NOVA Travel:
1. **WhatsApp Notification Automation Helper (`lib/whatsapp.ts`)**: Automated customer alerts on booking creation, status changes, and reminders.
2. **Multi-Currency & i18n Currency Switcher (`components/CurrencySwitcher.tsx`)**: Live conversion between IDR, USD, EUR, SGD for packages and destinations.
3. **Verified Traveler Review Engine (`app/api/reviews/route.ts` & `components/VerifiedReviewForm.tsx`)**: Verified review submission restricted to users with confirmed bookings.
4. **Admin Audit Trail & Logs (`app/admin/audit-logs/page.tsx` & `lib/audit.ts`)**: Immutable activity logging for administrative actions.
5. **AI Itinerary-to-Booking Direct Converter (`components/planner/AIConvertBookingModal.tsx`)**: 1-Click conversion from AI-generated travel itineraries into live bookings.

---

## 2. Technical Architecture & File Map

### 2.1 WhatsApp Notification Engine (`lib/whatsapp.ts`)
- Configurable environment-aware helper (supports Fonnte/Wablas API with graceful console logging when API key is unconfigured).
- Triggers on:
  - Booking Creation (Send booking code & details).
  - Status Update (`Confirmed` / `Cancelled`).
  - Refund status updates.

### 2.2 Currency Switcher & Conversion System (`components/CurrencySwitcher.tsx` & `context/CurrencyContext.tsx`)
- Supports `IDR` (Rp), `USD` ($), `EUR` (€), `SGD` (S$).
- Live exchange rates:
  - 1 USD = 15,800 IDR
  - 1 EUR = 17,200 IDR
  - 1 SGD = 11,800 IDR
- Component integrates cleanly into the site Navbar / Header.

### 2.3 Verified Traveler Review System (`app/api/reviews/route.ts` & `app/reviews/page.tsx`)
- Server validation: Ensures reviewer email/userId matches a `confirmed` booking in `Booking` table.
- Verified Traveler badge badge display.

### 2.4 Admin Audit Log Engine (`app/admin/audit-logs/page.tsx` & `lib/audit.ts`)
- Logs administrative actions (role updates, refund approvals, booking status changes, price updates).
- UI route at `/admin/audit-logs` registered in Admin Sidebar Navigation.

### 2.5 AI Itinerary-to-Booking Converter (`components/planner/AIConvertBookingModal.tsx`)
- Integrated into `/ai-planner`.
- Extracts AI itinerary details (destination, days, estimated budget), pre-fills the booking modal, and creates a real booking record.

---

## 3. Acceptance Criteria

- [x] WhatsApp helper logs/sends formatted messages on booking events.
- [x] Currency switcher allows switching between IDR, USD, EUR, SGD across the platform.
- [x] Review submission verifies user booking status before posting.
- [x] Admin actions are recorded in `/admin/audit-logs`.
- [x] AI Planner allows 1-click booking conversion from AI itineraries.
