# Admin UI Redesign Specification (Minimalist Premium & Luxury)

## Overview
This specification outlines the redesign of the NOVA Admin UI (`/admin`) into a **Minimalist Premium & Luxury** interface. The goal is to replace the basic black sidebar and plain grid layout with a polished, modern, high-contrast dashboard shell featuring grouped navigation, Lucide icons, a topbar header with breadcrumbs and user controls, styled stats cards, and unified data tables.

## Requirements & Design Decisions

### 1. Color Palette & Typography
- **Sidebar**: Neutral-950 background (`#09090b`) with refined dark borders (`#27272a`), crisp white brand title, and muted navigation items with clear active highlights (`bg-white/10 text-white`).
- **Main Area**: Clean neutral-50 background (`#f8fafc` / `#f9fafb`) with crisp white elevated cards (`bg-white`), hairline borders (`border-neutral-200/80`), and sharp typography.
- **Typography**: Inter/system-sans font hierarchy, uppercase muted labels for categories (`text-[10px] tracking-widest uppercase font-semibold text-neutral-400`).

### 2. Layout Structure (`app/admin/layout.tsx`)
- **Sidebar Navigation**:
  - Brand section with NOVA Admin badge and status indicator dot (Live).
  - Grouped Nav Categories:
    1. **Overview**: Dashboard (`/admin`)
    2. **Content**: Hero (`/admin/hero`), Destinations (`/admin/destinations`), Packages (`/admin/packages`), Testimonials (`/admin/testimonials`), FAQ (`/admin/faqs`), Features (`/admin/features`), How It Works (`/admin/how-it-works`)
    3. **Operations**: Bookings (`/admin/bookings`), Coupons (`/admin/coupons`)
    4. **System**: Settings (`/admin/settings`)
  - Icons for every item using `lucide-react` (`LayoutDashboard`, `Sparkles`, `MapPin`, `Package`, `MessageSquare`, `HelpCircle`, `Layers`, `ListOrdered`, `Calendar`, `Ticket`, `Settings`).
- **Topbar Header**:
  - Dynamic breadcrumbs showing current route hierarchy (e.g. `Admin / Bookings`).
  - Quick action link to return to live site (`Back to Website` with `ExternalLink` icon).
  - User identity badge with user email and Sign Out button.

### 3. Dashboard Page (`app/admin/page.tsx`)
- **Header Greeting**: Welcome title with date badge and quick status summary.
- **Stat & Overview Cards**:
  - Grid layout (3-4 columns) with count badges, section icons, descriptions, and subtle hover animations (`hover:border-neutral-400 hover:shadow-sm transition-all`).
  - Quick access buttons for high-priority management tasks.

### 4. Admin Sub-pages Styling Consistency
- Clean section headers with item counts and primary action buttons.
- Consistent table container styling (rounded borders, subtle background headers, crisp hover states).
- Muted luxury status badges (`Pending`, `Confirmed`, `Cancelled`) with clean color tones.

## File Changes
1. `app/admin/layout.tsx` - Complete overhaul of sidebar navigation, topbar, and layout shell.
2. `app/admin/page.tsx` - Enhanced dashboard page with stats cards and quick shortcuts.
