# Task 2 Brief: Redesign Admin Dashboard Page (`app/admin/page.tsx`)

## Plan File
`docs/superpowers/plans/2026-07-28-admin-ui-redesign.md`

## Requirements
Modify `app/admin/page.tsx` to implement a high-contrast Minimalist Premium & Luxury dashboard page.

### Details:
1. **Welcome Header**:
   - Clock icon with current date formatted (e.g. "Tuesday, July 28, 2026").
   - Title: "Dashboard Overview".
   - Subtitle: "Manage content, view bookings, and update settings across NOVA."
2. **Dashboard Cards Grid**:
   - Grid layout (1 col mobile, 2 sm, 3 lg).
   - Cards array with icons:
     - Bookings (`Calendar`, highlight card)
     - Destinations (`MapPin`)
     - Packages (`Package`)
     - Coupons & Promos (`Ticket`)
     - Testimonials (`MessageSquare`)
     - FAQ (`HelpCircle`)
     - Hero Section (`Sparkles`)
     - Features (`Layers`)
     - How It Works (`ListOrdered`)
     - Settings (`Settings`)
   - Card Styling:
     - `bg-white rounded-xl p-5 border transition-all duration-200 group`
     - Highlight card: `border-neutral-900 shadow-xs ring-1 ring-neutral-900/5`
     - Regular cards: `border-neutral-200/80 hover:border-neutral-900 hover:shadow-xs`
     - Header icon badge: `p-2 rounded-lg bg-neutral-100 text-neutral-800 group-hover:bg-neutral-950 group-hover:text-white transition-colors`
     - Arrow icon: `ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"`
     - Total count footer: `border-t border-neutral-100 flex items-center justify-between` with label `TOTAL ITEMS` and large bold counter.
3. **Loading State**:
   - Skeleton grid loader cards with `animate-pulse`.

## Report File
Write the report to `.superpowers/sdd/2026-07-28-admin-ui-redesign/task-2-report.md`.
