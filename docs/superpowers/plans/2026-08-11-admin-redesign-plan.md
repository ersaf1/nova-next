# Admin Dashboard Redesign & Booking Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Admin Dashboard UI (`Dominator/nova-next/app/admin/page.tsx`) to eliminate excessive vertical scrolling by implementing a modern shadcn UI-inspired tabbed interface in a clean gray and white color palette.

**Architecture:** Split the monolithic stacked layout of the admin page into a fixed KPI Summary top section and a 3-tab content view (`Overview`, `Analytics & Minat`, `Pintasan Modul`) using React local state for tabs, shadcn-styled components, and Lucide icons.

**Tech Stack:** Next.js 14+ (App Router), React 18, Tailwind CSS, Lucide React icons.

## Global Constraints
- Target File: `Dominator/nova-next/app/admin/page.tsx`
- Color Palette: Monochromatic Gray & White (`bg-zinc-50`, `bg-white`, `border-zinc-200`, `text-zinc-900`, `text-zinc-500`, subtle semantic badges for status).
- Tabbed layout eliminates long scrolling down.

---

### Task 1: Refactor Admin Dashboard Component Layout with shadcn UI Tabs & Gray-White Theme

**Files:**
- Modify: `Dominator/nova-next/app/admin/page.tsx`

**Interfaces:**
- Consumes: `/api/destinations`, `/api/packages`, `/api/testimonials`, `/api/faqs`, `/api/bookings`, `/api/coupons?admin=true`
- Produces: Redesigned Admin Dashboard page UI with 3 tabs (`Overview`, `Analytics & Minat`, `Pintasan Modul`).

- [ ] **Step 1: Update `app/admin/page.tsx` state and tab bar UI**

Implement `activeTab` state (`'overview' | 'analytics' | 'modules'`) and render the top KPI summary stats bar alongside the tab navigation bar.

- [ ] **Step 2: Implement Tab 1 (Overview View)**

Render status conversion ratio, quick status metrics, and the 3-5 latest booking records with clean cards and status badges.

- [ ] **Step 3: Implement Tab 2 (Analytics & Minat View)**

Render popular destination ranking metrics with views, tags (High Demand, Trending, Popular), rating, price, and percentage progress bars.

- [ ] **Step 4: Implement Tab 3 (Pintasan Modul View)**

Render 10 administrative module cards in a 3-column grid layout with item counters, description, and hover transitions.

- [ ] **Step 5: Verify build & TypeScript compilation**

Run: `npx tsc --noEmit` or `npm run build` inside `Dominator/nova-next` to confirm zero compilation errors.

---

### Task 2: Verification and UI Polish

**Files:**
- Modify: `Dominator/nova-next/app/admin/page.tsx`

- [ ] **Step 1: Check responsive behavior & contrast**

Ensure tabs, KPI cards, and grids adapt gracefully to desktop and mobile screens.

- [ ] **Step 2: Final Verification**

Run Next.js dev server check / lint verification.
