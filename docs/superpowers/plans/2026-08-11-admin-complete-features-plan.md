# Admin & User Complete Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement User Management (`/admin/users`), E-Invoice & E-Tiket printable modal (`components/EInvoiceModal.tsx`), and Financial Reports with CSV Export (`/admin/reports`).

**Architecture:** Create API routes `/api/admin/users`, `/api/admin/users/[id]/role`, build the User Management page, construct the E-Invoice printable component, build the Reports & CSV Export page, and register new navigation links in Admin Layout.

**Tech Stack:** Next.js (App Router), React 18, Supabase Admin Client, Tailwind CSS, Lucide React icons.

## Global Constraints
- Target Paths: `Dominator/nova-next/app/admin/users/page.tsx`, `Dominator/nova-next/app/admin/reports/page.tsx`, `Dominator/nova-next/components/EInvoiceModal.tsx`, `Dominator/nova-next/app/admin/layout.tsx`.
- Monochromatic gray & white styling (`bg-zinc-50`, `bg-white`, `border-zinc-200`, `text-zinc-900`).

---

### Task 1: Create API Routes for Admin Users Management

**Files:**
- Create: `Dominator/nova-next/app/api/admin/users/route.ts`
- Create: `Dominator/nova-next/app/api/admin/users/[id]/role/route.ts`

- [ ] **Step 1: Create `/api/admin/users/route.ts`**

Fetch registered users from Supabase / Bookings database with aggregated booking count and total spend.

- [ ] **Step 2: Create `/api/admin/users/[id]/role/route.ts`**

PATCH handler to update user role (`user` / `admin` / `super_admin`).

---

### Task 2: Build User Management Center Page (`/admin/users/page.tsx`)

**Files:**
- Create: `Dominator/nova-next/app/admin/users/page.tsx`
- Modify: `Dominator/nova-next/app/admin/layout.tsx`

- [ ] **Step 1: Create User Management Page UI**

Render stats cards, user table, search/filter, and User Detail Modal with booking history and role switcher.

- [ ] **Step 2: Add Users & Reports navigation links to `app/admin/layout.tsx`**

Add `{ path: '/admin/users', label: 'User Management', icon: Users }` and `{ path: '/admin/reports', label: 'Laporan & Export', icon: FileSpreadsheet }` to `navCategories`.

---

### Task 3: Build Printable E-Invoice & E-Tiket Component (`components/EInvoiceModal.tsx`)

**Files:**
- Create: `Dominator/nova-next/components/EInvoiceModal.tsx`
- Modify: `Dominator/nova-next/app/admin/bookings/page.tsx`

- [ ] **Step 1: Create `components/EInvoiceModal.tsx`**

Render printable invoice with branded header, booking ref code, itemized costs, passenger list, QR placeholder, and status stamp. Include `window.print()` trigger.

- [ ] **Step 2: Connect E-Invoice Modal to `/admin/bookings/page.tsx`**

Add "E-Invoice / Tiket" button to booking row and detail modal.

---

### Task 4: Build Reports & CSV Export Center (`/admin/reports/page.tsx`)

**Files:**
- Create: `Dominator/nova-next/app/admin/reports/page.tsx`

- [ ] **Step 1: Create Reports Page UI**

Render date-range filter tabs, revenue analytics summary, booking conversion metrics, printable report preview, and 1-Click "Export CSV" button.

- [ ] **Step 2: Verification & TypeScript compilation**

Run `npx tsc --noEmit` to ensure zero compilation errors.
