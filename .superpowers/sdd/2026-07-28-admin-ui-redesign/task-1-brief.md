# Task 1 Brief: Redesign Admin Shell Layout (`app/admin/layout.tsx`)

## Plan File
`docs/superpowers/plans/2026-07-28-admin-ui-redesign.md`

## Requirements
Modify `app/admin/layout.tsx` to implement a high-contrast Minimalist Premium & Luxury dashboard shell.

### Details:
1. **Sidebar (`w-64 bg-neutral-950 text-white flex flex-col shrink-0 border-r border-neutral-800`)**:
   - Header with brand "NOVA Admin", badge "N", subtitle "Management Hub", and green online status dot.
   - Categorized Navigation Items:
     - **Overview**: Dashboard (`/admin`, exact match)
     - **Content Management**: Hero Section (`/admin/hero`), Destinations (`/admin/destinations`), Packages (`/admin/packages`), Testimonials (`/admin/testimonials`), FAQ (`/admin/faqs`), Features (`/admin/features`), How It Works (`/admin/how-it-works`)
     - **Operations**: Bookings (`/admin/bookings`), Coupons & Promos (`/admin/coupons`)
     - **System**: Settings (`/admin/settings`)
   - Every navigation item must use a Lucide React icon (`LayoutDashboard`, `Sparkles`, `MapPin`, `Package`, `MessageSquare`, `HelpCircle`, `Layers`, `ListOrdered`, `Calendar`, `Ticket`, `Settings`).
   - Active state: `bg-white text-neutral-950 font-semibold shadow-xs` with `ChevronRight` icon.
   - Inactive state: `text-neutral-400 hover:text-white hover:bg-neutral-900`.
   - Footer section:
     - Display user email if logged in (with `User` icon).
     - Link "Back to site" (`/`) with `ExternalLink` icon.
     - Button "Sign out" with `LogOut` icon.

2. **Topbar Header (`h-14 bg-white border-b border-neutral-200/80 px-8 flex items-center justify-between sticky top-0 z-10`)**:
   - Dynamic Breadcrumbs: `Admin / <Current Page Label>`.
   - Status Badge: `Authenticated Admin` (with `ShieldCheck` icon, green tint).

3. **Main Content (`flex-1 p-8 overflow-y-auto bg-neutral-50`)**:
   - Renders `{children}`.

## Report File
Write the report to `.superpowers/sdd/2026-07-28-admin-ui-redesign/task-1-report.md`.
