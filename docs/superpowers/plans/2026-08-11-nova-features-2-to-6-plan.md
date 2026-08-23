# NOVA Travel Advanced Features 2-6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement WhatsApp Notifications (`lib/whatsapp.ts`), Multi-Currency Switcher (`components/CurrencySwitcher.tsx`), Verified Traveler Reviews (`app/api/reviews/route.ts`), Admin Audit Logs (`app/admin/audit-logs/page.tsx`), and AI Itinerary-to-Booking Converter (`components/planner/AIConvertBookingModal.tsx`).

**Architecture:** Build utility libraries, Next.js API routes, UI components, and Admin dashboard pages, ensuring zero TypeScript compilation errors.

---

### Task 1: WhatsApp Notification Engine (`lib/whatsapp.ts`)

**Files:**
- Create: `Dominator/nova-next/lib/whatsapp.ts`
- Modify: `Dominator/nova-next/app/api/bookings/route.ts`
- Modify: `Dominator/nova-next/app/api/bookings/[id]/status/route.ts`

- [ ] **Step 1: Create `lib/whatsapp.ts`**
  Implement WhatsApp notification sender with templates for booking creation, status update, and reminder alerts.

- [ ] **Step 2: Connect triggers in booking API routes**
  Invoke `sendWhatsAppNotification()` on booking creation and status update.

---

### Task 2: Multi-Currency & i18n Currency Switcher (`context/CurrencyContext.tsx` & `components/CurrencySwitcher.tsx`)

**Files:**
- Create: `Dominator/nova-next/context/CurrencyContext.tsx`
- Create: `Dominator/nova-next/components/CurrencySwitcher.tsx`
- Modify: `Dominator/nova-next/app/layout.tsx`
- Modify: `Dominator/nova-next/components/Navbar.tsx`

- [ ] **Step 1: Create `CurrencyContext.tsx`**
  State management for active currency (`IDR`, `USD`, `EUR`, `SGD`) and formatting helper function `formatPrice(amountInIDR)`.

- [ ] **Step 2: Create `CurrencySwitcher.tsx` & add to Navbar**
  Render dropdown currency selector in header.

---

### Task 3: Verified Traveler Review System (`app/api/reviews/route.ts` & `app/reviews/page.tsx`)

**Files:**
- Create: `Dominator/nova-next/app/api/reviews/route.ts`
- Create: `Dominator/nova-next/app/reviews/page.tsx`

- [ ] **Step 1: Create `/api/reviews/route.ts`**
  Validate user email has a `confirmed` booking before inserting review into database with `verified: true` flag.

- [ ] **Step 2: Create Public Reviews Page `/reviews`**
  Display verified customer reviews, rating filter, and review submission modal.

---

### Task 4: Admin Audit Log System (`lib/audit.ts` & `app/admin/audit-logs/page.tsx`)

**Files:**
- Create: `Dominator/nova-next/lib/audit.ts`
- Create: `Dominator/nova-next/app/api/admin/audit-logs/route.ts`
- Create: `Dominator/nova-next/app/admin/audit-logs/page.tsx`
- Modify: `Dominator/nova-next/app/admin/layout.tsx`

- [ ] **Step 1: Create `lib/audit.ts` & `/api/admin/audit-logs/route.ts`**
  Record administrative actions into Supabase / local audit storage.

- [ ] **Step 2: Create `/admin/audit-logs/page.tsx` & update Admin Layout nav**
  Render searchable audit log table in Admin panel.

---

### Task 5: AI Itinerary to Booking Direct Converter (`components/planner/AIConvertBookingModal.tsx`)

**Files:**
- Create: `Dominator/nova-next/components/planner/AIConvertBookingModal.tsx`
- Modify: `Dominator/nova-next/app/ai-planner/page.tsx`

- [ ] **Step 1: Create `AIConvertBookingModal.tsx`**
  Convert AI itinerary data into a booking payload and trigger `/api/bookings` creation.

- [ ] **Step 2: Add "Book Itinerary Ini Sekarang" button to `/ai-planner/page.tsx`**
  Connect AI planner output to converter modal.

- [ ] **Step 3: Verification & TypeScript compilation**
  Run `npx tsc --noEmit` to ensure clean build.
