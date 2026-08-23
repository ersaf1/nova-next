# Admin & User Complete Features Spec (User Management, E-Invoice, Reports)

**Date:** 2026-08-11  
**Project:** NOVA Travel (Next.js App)  
**Location:** `Dominator/nova-next/app/admin/users/`, `Dominator/nova-next/app/admin/reports/`, `Dominator/nova-next/app/admin/bookings/`, `Dominator/nova-next/components/`

---

## 1. Executive Summary

Implement three core management modules to transform NOVA Travel into a complete enterprise-grade platform:
1. **User Management Center (`/admin/users`)**: Complete user account listing, user transaction history, search/filtering, role editing, and account metrics.
2. **E-Invoice & E-Tiket Engine (`components/EInvoiceModal.tsx`)**: Official printable/downloadable PDF E-Invoice & E-Tiket with QR code verification, booking reference ID, itemized breakdown, and branded header.
3. **Reports & Financial Data Export (`/admin/reports`)**: Date-range filtered revenue reporting, booking conversion analytics, and 1-Click CSV/Excel data export.

---

## 2. Component & Architecture Breakdown

### 2.1 User Management Center (`/admin/users/page.tsx`)
- **API Integration**: `/api/admin/users` (Fetches user list + aggregated booking count + total spend).
- **KPI Summary Cards**: Total Users Registered, Active Bookers Count, Super Admins Count.
- **Search & Filter**: Search by name/email, filter by role (`user`, `admin`, `super_admin`).
- **User Detail Modal**:
  - Displays user profile, email, phone, creation date.
  - Lists all booking records linked to user's email.
  - Role management selector with immediate API patch updates.

### 2.2 E-Invoice & E-Tiket Component (`components/EInvoiceModal.tsx`)
- **Trigger**: "Cetak E-Tiket / Invoice" button on `/admin/bookings` and user dashboard.
- **Content Structure**:
  - Branded NOVA Travel Header with logo & address.
  - Invoice Number (e.g. `INV-NOVA-202608-0012`) & Booking Reference ID (`NOVA-7B3F`).
  - Customer contact details & travel date.
  - Itemized pricing breakdown (Package Base Price x Participants).
  - Status stamp badge (`LUNAS / CONFIRMED`).
  - Printable layout (`window.print()` / print media queries styled for clean PDF output).

### 2.3 Reports & Export Center (`/admin/reports/page.tsx`)
- **API Integration**: `/api/admin/reports` (Combines booking analytics, revenue, date-range filtering).
- **Date Filters**: Today, This Month, Last 30 Days, Year-to-Date.
- **Export Functionality**:
  - `exportToCSV()` helper that converts booking JSON into clean CSV file download (`nova-bookings-report-2026.csv`).
- **Financial Performance Overview**: Revenue, total bookings, confirmed count, cancellation rate.

---

## 3. Sidebar Integration

Add `Users` and `Reports` to `navCategories` in `Dominator/nova-next/app/admin/layout.tsx`:
- Operations Category:
  - `{ path: '/admin/users', label: 'User Management', icon: Users }`
  - `{ path: '/admin/reports', label: 'Laporan & Export', icon: FileSpreadsheet }`

---

## 4. Acceptance Criteria

- [x] `/admin/users` allows viewing, searching, and inspecting registered users and their transaction histories.
- [x] `/admin/bookings` includes E-Invoice & E-Tiket modal generator with print/download functionality.
- [x] `/admin/reports` features date filtering and 1-Click CSV export.
- [x] Admin sidebar nav updated with clean icon links to Users and Reports.
