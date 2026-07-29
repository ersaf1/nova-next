# NOVA Mobile — Sub-Project 1: Foundation

## Goal
Bootstrap repo Expo baru (terpisah dari nova-next) yang terhubung ke Supabase yang sama, lengkap dengan navigasi tab, auth email/password, dan screen skeleton untuk semua fitur utama.

## Context
- **Backend API:** nova-next (Next.js 16) running di http://localhost:3000
- **Endpoints:**
  - GET /api/destinations
  - GET /api/packages
  - POST /api/bookings
  - GET /api/bookings?email=
  - POST /api/payment/create
  - POST /api/ai/itinerary
- **Database:** Supabase (sama dengan nova-next)
- **Auth:** Supabase email/password via anon key
- **Mobile repo:** C:\Users\lulus\Dominator\nova-mobile\

## DB Schema
```
Destination: id, city, country, image, description, rating, duration, price, category
Package:     id, tag, tagColor, title, subtitle, image, price, originalPrice, duration, groupSize, rating, reviews, includes, highlight, category
Booking:     id, packageName, country, name, email, phone, travelDate, participants, notes, status, totalAmount, midtrans_order_id, created_at
Wishlist:    id, user_id, destination_id, created_at
```

## Deliverables
1. npx expo start jalan tanpa error
2. Login/register email+password via Supabase
3. Navigasi 5 tab: Explore, Search, Bookings, AI Chat, Profile
4. Screen skeleton per tab
5. Auth persisted setelah restart (SecureStore)
6. API client siap dipakai sub-project berikutnya

---

## Tech Stack

| Layer | Library | Versi |
|---|---|---|
| Framework | Expo SDK | 52 |
| Language | TypeScript | ~5.x |
| Navigation | Expo Router v4 | latest |
| Auth + DB | @supabase/supabase-js | ^2.110.8 |
| Token storage | expo-secure-store | latest |
| Icons | @expo/vector-icons | built-in |

---

## File Map

| File | Tanggung Jawab |
|------|----------------|
| app.json | Expo config, scheme, plugins |
| .env | Supabase URL, anon key, API URL |
| lib/supabase.ts | createClient dengan SecureStore adapter |
| lib/api.ts | Typed fetch helpers ke nova-next |
| lib/constants.ts | COLORS, SPACING, FONT_SIZE |
| types/index.ts | Destination, Package, Booking, BookingPayload, PaymentPayload |
| hooks/useAuth.ts | Auth state hook |
| app/_layout.tsx | Root layout + auth guard |
| app/(auth)/_layout.tsx | Layout auth screens |
| app/(auth)/login.tsx | Form login |
| app/(auth)/register.tsx | Form register |
| app/(tabs)/_layout.tsx | Tab navigator 5 tab |
| app/(tabs)/index.tsx | Explore skeleton |
| app/(tabs)/search.tsx | Search skeleton |
| app/(tabs)/bookings.tsx | Bookings skeleton |
| app/(tabs)/chat.tsx | AI Chat skeleton |
| app/(tabs)/profile.tsx | Profile + logout |
| app/+not-found.tsx | 404 screen |

---

## Task 1 — Init project & install dependencies
**Files:** app.json, package.json, .env

```bash
# Di C:\Users\lulus\Dominator\
npx create-expo-app@latest nova-mobile --template blank-typescript
cd nova-mobile
npx expo install expo-router expo-secure-store expo-constants expo-notifications
npx expo install react-native-maps expo-linking expo-status-bar
npx expo install react-native-safe-area-context react-native-screens
npx expo install @supabase/supabase-js
```

Update app.json:
```json
{
  "expo": {
    "name": "NOVA Travel",
    "slug": "nova-mobile",
    "scheme": "nova",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "experiments": { "typedRoutes": true },
    "plugins": ["expo-router", "expo-secure-store"],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0f0f1a"
      }
    },
    "ios": { "bundleIdentifier": "com.nova.travel" },
    "web": { "bundler": "metro" }
  }
}
```

Buat .env (ambil nilai dari nova-next/.env):
```
EXPO_PUBLIC_SUPABASE_URL=<nilai NEXT_PUBLIC_SUPABASE_URL>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<nilai NEXT_PUBLIC_SUPABASE_ANON_KEY>
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Test:** npx expo start muncul QR code tanpa error.

---

## Task 2 — Core lib: supabase, api, constants, types
**Files:** lib/supabase.ts, lib/api.ts, lib/constants.ts, types/index.ts

### lib/supabase.ts
```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

### types/index.ts
```typescript
export type Destination = {
  id: number; city: string; country: string; image: string
  description: string; rating: number; duration: string; price: string; category: string
}
export type Package = {
  id: number; tag: string; tagColor: string; title: string; subtitle: string
  image: string; price: number; originalPrice: number; duration: string
  groupSize: string; rating: number; reviews: number; includes: string
  highlight: string; category: string
}
export type Booking = {
  id: number; packageName: string; country: string; name: string; email: string
  phone: string; travelDate: string; participants: number; notes: string
  status: 'pending' | 'confirmed' | 'cancelled'; totalAmount: number
  midtrans_order_id: string; created_at: string
}
export type BookingPayload = Omit<Booking, 'id' | 'status' | 'midtrans_order_id' | 'created_at'>
export type PaymentPayload = {
  bookingId: number; amount: number; customerName: string; customerEmail: string
  items?: { id: string; price: number; quantity: number; name: string }[]
}
```

### lib/api.ts
```typescript
import type { Destination, Package, Booking, BookingPayload, PaymentPayload } from '@/types'

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

export const getDestinations = () => apiFetch<Destination[]>('/api/destinations')
export const getPackages = () => apiFetch<Package[]>('/api/packages')
export const getBookings = (email: string) =>
  apiFetch<Booking[]>(`/api/bookings?email=${encodeURIComponent(email)}`)
export const createBooking = (data: BookingPayload) =>
  apiFetch<{ id: number }>('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
export const createPayment = (data: PaymentPayload) =>
  apiFetch<{ token: string; redirect_url: string; orderId: string }>(
    '/api/payment/create', { method: 'POST', body: JSON.stringify(data) }
  )
export const generateItinerary = (destination: string, duration: number) =>
  apiFetch<object>('/api/ai/itinerary', {
    method: 'POST', body: JSON.stringify({ destination, duration }),
  })
```

### lib/constants.ts
```typescript
export const COLORS = {
  primary: '#6366f1', primaryDark: '#4f46e5', background: '#0f0f1a',
  surface: '#1a1a2e', card: '#16213e', text: '#ffffff', textMuted: '#9ca3af',
  border: '#2d2d44', success: '#22c55e', warning: '#f59e0b', error: '#ef4444',
}
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 }
export const FONT_SIZE = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 36 }
```

**Test:** npx tsc --noEmit tanpa error.

---

## Task 3 — Auth hook
**File:** hooks/useAuth.ts

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session); setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return {
    session, user, loading,
    signIn: (email: string, password: string) =>
      supabase.auth.signInWithPassword({ email, password }),
    signUp: (email: string, password: string) =>
      supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }
}
```

---

## Task 4 — Root layout + auth guard
**Files:** app/_layout.tsx, app/+not-found.tsx

### app/_layout.tsx
```typescript
import { Slot, useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function RootLayout() {
  const { session, loading } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    const inAuth = segments[0] === '(auth)'
    if (!session && !inAuth) router.replace('/(auth)/login')
    if (session && inAuth) router.replace('/(tabs)')
  }, [session, loading, segments])

  if (loading) return null
  return <Slot />
}
```

**Test:** Tanpa login harus redirect ke /(auth)/login.

---

## Task 5 — Auth screens
**Files:** app/(auth)/_layout.tsx, app/(auth)/login.tsx, app/(auth)/register.tsx

### app/(auth)/login.tsx — form email+password
- Input email (keyboardType="email-address", autoCapitalize="none")
- Input password (secureTextEntry)
- Tombol "Masuk" → signIn(email, password)
- Error handling dengan mapError() seperti di nova-next/app/login/page.tsx
- Link ke register
- Style: background COLORS.background, card COLORS.surface, accent COLORS.primary

### app/(auth)/register.tsx — form nama+email+password
- Input name, email, password
- Tombol "Daftar" → signUp(email, password)
- Setelah berhasil tampilkan "Cek email kamu untuk konfirmasi"
- Link ke login

**Test:**
- Login akun existing → masuk ke tabs
- Login password salah → tampilkan error
- Register akun baru → tampilkan pesan konfirmasi

---

## Task 6 — Tab navigator + screen skeletons
**Files:** app/(tabs)/_layout.tsx, app/(tabs)/index.tsx, app/(tabs)/search.tsx,
           app/(tabs)/bookings.tsx, app/(tabs)/chat.tsx, app/(tabs)/profile.tsx

### app/(tabs)/_layout.tsx — 5 tab dengan Ionicons
```typescript
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/lib/constants'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textMuted,
      tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
      headerStyle: { backgroundColor: COLORS.surface },
      headerTintColor: COLORS.text,
    }}>
      <Tabs.Screen name="index" options={{ title: 'Explore',
        tabBarIcon: ({ color }) => <Ionicons name="compass" size={24} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: 'Search',
        tabBarIcon: ({ color }) => <Ionicons name="search" size={24} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: 'Bookings',
        tabBarIcon: ({ color }) => <Ionicons name="calendar-outline" size={24} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'AI Chat',
        tabBarIcon: ({ color }) => <Ionicons name="sparkles-outline" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile',
        tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }} />
    </Tabs>
  )
}
```

### app/(tabs)/profile.tsx — tampilkan email + tombol logout
```typescript
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { COLORS, SPACING, FONT_SIZE } from '@/lib/constants'

export default function ProfileScreen() {
  const { user, signOut } = useAuth()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  email: { fontSize: FONT_SIZE.md, color: COLORS.textMuted, marginBottom: SPACING.xl },
  logoutBtn: { backgroundColor: COLORS.error, borderRadius: 10, padding: SPACING.md, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: FONT_SIZE.md },
})
```

**Test:**
- 5 tab muncul, bisa diswitch
- Profile tampilkan email user
- Tombol Keluar → redirect ke login

---

## Verification Checklist

- [ ] npx expo start jalan tanpa error
- [ ] Login email+password berhasil (akun dari nova-next Supabase)
- [ ] 5 tab muncul dan bisa diswitch setelah login
- [ ] Tab Profile tampilkan email user
- [ ] Tombol Keluar → redirect ke login
- [ ] Register akun baru berhasil
- [ ] Restart app → tetap logged in (SecureStore persist)
- [ ] npx tsc --noEmit tanpa error

---

## Sub-Projects Berikutnya

| # | Plan File | Fitur |
|---|-----------|-------|
| 2 | 2026-07-28-nova-mobile-ai-chat.md | Streaming Gemini chat, riwayat per session |
| 3 | 2026-07-28-nova-mobile-booking.md | Browse destinasi, detail, booking wizard, Midtrans |
| 4 | 2026-07-28-nova-mobile-history.md | Booking history, detail, edit profil |
| 5 | 2026-07-28-nova-mobile-maps-notif.md | react-native-maps, Expo push notifications |
