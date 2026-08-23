# Admin Dashboard Redesign & Booking Analytics Spec

**Date:** 2026-08-11  
**Project:** NOVA Travel (Next.js App)  
**Location:** `Dominator/nova-next/app/admin/page.tsx` & `Dominator/nova-next/app/admin/layout.tsx`

---

## 1. Executive Summary

Redesign the Admin Dashboard page in `Dominator/nova-next/app/admin/page.tsx` to solve the excessive vertical scrolling issue, modernize the visual aesthetic using a **shadcn UI-inspired** design system, apply a sleek monochromatic **gray & white (zinc/neutral)** color palette, and clarify booking status management and analytics.

---

## 2. Goals & Key Principles

1. **Eliminate Long Vertical Scrolling**: Organize dashboard content into clean, accessible **Tabs** (`Overview`, `Analytics & Minat`, `Pintasan Modul`) while keeping top-level KPI summary cards pinned.
2. **Modern shadcn UI Aesthetic**:
   - Clean, rounded cards (`rounded-xl`), subtle borders (`border-zinc-200` / `#e4e4e7`), soft shadows (`shadow-xs`).
   - Clean badges with dot status indicators.
   - Elegant tab navigation bar (`bg-zinc-100/80` container, active tab white card with soft shadow).
3. **Monochromatic Gray & White Color Palette**:
   - Primary neutral background: `bg-zinc-50`.
   - Card backgrounds: `bg-white`.
   - Text & headings: `text-zinc-900` (primary titles), `text-zinc-500` (secondary labels).
   - Accents: Subtle semantic badge colors for status (Emerald for Confirmed, Amber for Pending, Rose for Cancelled).
4. **Booking Operational Workflow Integration**:
   - Display real-time KPI metrics for Estimated Revenue, Total Bookings, Destination Catalog, and Active Promos.
   - Present recent booking items with quick status indicators and direct navigation to `/admin/bookings`.

---

## 3. Layout & Component Architecture

### 3.1 Header & Top KPI Stats (Fixed Top Section)
- **Header**:
  - Live Date indicator & Live Data Sync status badge.
  - Page title: `Dashboard & Analytics`.
- **4 KPI Cards Grid**:
  1. **Estimasi Omset Booking**: Total revenue calculated from active bookings + participant count.
  2. **Total Booking Masuk**: Total booking count + Approved/Pending breakdown badges.
  3. **Destinasi & Katalog**: Total destinations + active travel packages count.
  4. **Voucher & Ulasan**: Total active coupons + customer review count.

### 3.2 Main Content Area with shadcn UI Tabs
Tabs Trigger Bar (`Overview`, `Analytics & Minat`, `Pintasan Modul`):

- **Tab 1: Overview**
  - **Left Section (Rasio Status Booking)**:
    - Multi-color progress bar showing ratio of Confirmed, Pending, Cancelled bookings.
    - Quick counter cards for each status.
    - Quick action link to `/admin/bookings`.
  - **Right Section (Booking Terbaru)**:
    - Card list of top 3-5 latest booking records with customer name, package title, participant count, status badge, and direct view link.

- **Tab 2: Analytics & Minat**
  - **Statistik Minat Pengunjung & Destinasi Populer**:
    - Top ranked destinations with view metrics, popularity tags (High Demand, Trending, Popular), rating, starting price, and percentage progress bars.
  - **Financial Metrics Breakdown**:
    - Average revenue per booking, traveler conversion metrics.

- **Tab 3: Pintasan Modul**
  - Grid of 10 administrative module cards (Bookings, Refunds, Destinations, Packages, Coupons, Hero, Testimonials, FAQ, Features, How It Works, Settings).
  - Clean card with icon, description, total item count, and hover state transitions.

---

## 4. Technical Implementation Plan

1. **Modify `Dominator/nova-next/app/admin/page.tsx`**:
   - Implement state management for active tab selection (`activeTab: 'overview' | 'analytics' | 'modules'`).
   - Re-architect UI into modular sections corresponding to top KPI stats and the 3 tab views.
   - Ensure full responsive design (mobile, tablet, desktop).
2. **Refine Styling**:
   - Ensure all color utility classes strictly follow the `zinc` / `neutral` gray-and-white theme (`bg-zinc-50`, `bg-white`, `border-zinc-200`, `text-zinc-900`, `text-zinc-500`).
3. **Verification**:
   - Run Next.js build / dev check to ensure zero TypeScript errors or missing imports.

---

## 5. Acceptance Criteria

- [x] Admin dashboard layout replaces single long scroll with tabbed view (`Overview`, `Analytics & Minat`, `Pintasan Modul`).
- [x] Top KPI cards remain clear and accessible.
- [x] Color scheme strictly monochromatic gray & white with clean shadcn UI styling.
- [x] Booking workflow and status metrics operate accurately with live API data.
