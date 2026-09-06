'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'

type Tab = 'signin' | 'signup'

function mapError(message: string): string {
  if (!message) return 'Terjadi kesalahan. Silakan coba lagi.'
  if (message.includes('Invalid login credentials')) {
    return 'Email atau password salah. Jika Anda baru saja mendaftar, silakan periksa inbox/spam email Anda untuk melakukan konfirmasi akun terlebih dahulu sebelum Sign In.'
  }
  if (message.includes('User already registered') || message.includes('already registered') || message.includes('already exists')) return 'Email ini sudah terdaftar. Silakan pilih tab Sign In di atas.'
  if (message.includes('Email not confirmed')) return 'Email belum dikonfirmasi. Silakan periksa inbox/spam email Anda untuk mengeklik tautan konfirmasi.'
  if (message.includes('Password should be at least')) return 'Password minimal 6 karakter.'
  if (message.includes('rate limit') || message.includes('Rate limit')) return 'Terlalu banyak percobaan. Harap tunggu sebentar.'
  return message
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const isAdminLogin = redirect.startsWith('/admin')

  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) === 'signup' ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function switchTab(t: Tab) {
    setTab(t)
    setError('')
    setSuccess('')
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) {
      setError(mapError(error.message))
      setLoading(false)
      return
    }

    if (authData?.session?.access_token && typeof document !== 'undefined') {
      document.cookie = `sb-access-token=${authData.session.access_token}; path=/; max-age=604800; SameSite=Lax`
    }

    let targetUrl = redirect
    // If user logged in without specific redirect, check their role
    if (!searchParams.get('redirect') && authData?.session?.access_token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${authData.session.access_token}`
          }
        })
        const me = await res.json()
        if (me?.role && ['admin', 'super_admin', 'booking_officer'].includes(me.role)) {
          targetUrl = '/admin'
        }
      } catch {}
    }

    // Hard navigation so cookies & session are read freshly
    window.location.href = targetUrl
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak cocok.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // 1. Call Auto-Confirm API route (bypasses email confirmation & rate limits)
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const apiData = await res.json()

      if (!res.ok && apiData?.error && !apiData.error.includes('already registered')) {
        setError(mapError(apiData.error))
        setLoading(false)
        return
      }

      // 2. Immediately sign in the auto-confirmed user
      const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password })

      if (signInError) {
        // Fallback to client signup if admin creation didn't auto-login
        if (apiData?.error?.includes('already registered')) {
          setError('Email ini sudah terdaftar. Silakan beralih ke tab "Sign in" di atas.')
        } else {
          setError(mapError(signInError.message))
        }
        setLoading(false)
        return
      }

      if (signInData?.session) {
        setSuccess('Akun berhasil dibuat & terkonfirmasi! Mengalihkan ke dashboard...')
        setTimeout(() => {
          window.location.href = redirect
        }, 500)
      } else {
        setSuccess('Akun berhasil dibuat! Mengalihkan...')
        setTimeout(() => {
          window.location.href = redirect
        }, 500)
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan saat pendaftaran. Silakan coba lagi.')
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Enter your email address above, then click Forgot password.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    if (error) {
      setError(mapError(error.message))
    } else {
      setSuccess('Check your email for a reset link.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-[#FAF9F6] text-stone-900 selection:bg-[#EAE5D9] selection:text-stone-900 flex items-center justify-center px-6 py-24"
    >
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="mb-10 text-center">
          <span className="text-3xl font-semibold tracking-tight text-stone-900 font-serif-luxury">NOVA</span>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#C29B38]">Curated Luxury Journeys</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-9 shadow-xl shadow-stone-200/40 border border-stone-200/80">
          {/* Tabs — hide signup for admin login */}
          {!isAdminLogin && (
            <div className="flex rounded-full bg-[#F5F2EB] p-1 mb-8">
              {(['signin', 'signup'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    tab === t
                      ? 'bg-stone-900 text-[#FAF9F6] shadow-sm'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {t === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>
          )}
          {isAdminLogin && <div className="mb-8" />}

          {/* Form */}
          <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} noValidate>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-3 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-3 pr-11 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Forgot password — sign in only */}
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="mt-2 text-xs font-semibold text-[#C29B38] hover:text-[#9E7B27] hover:underline transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Confirm password — sign up only */}
              {tab === 'signup' && (
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      disabled={loading}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-stone-200/80 bg-stone-50 px-4 py-3 pr-11 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-900 transition cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Inline mismatch error */}
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-rose-500 font-medium">Passwords do not match.</p>
                  )}
                </div>
              )}
            </div>

            {/* Error / success banners */}
            {error && (
              <p className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-200/70 rounded-2xl px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-4 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-2xl px-4 py-3">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-stone-900 text-[#FAF9F6] rounded-2xl py-3.5 text-xs font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-stone-900/10 cursor-pointer"
            >
              {loading
                ? tab === 'signin' ? 'Signing in…' : 'Creating account…'
                : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* No guest checkout allowed */}
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

/** Skeleton that matches the card layout while useSearchParams resolves */
function LoginSkeleton() {
  return (
    <div
      className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-6 py-24"
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-10 text-center">
          <span className="text-3xl font-semibold tracking-tight text-stone-900 font-serif-luxury">NOVA</span>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#C29B38]">Curated Luxury Journeys</p>
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-3xl p-8 sm:p-9 shadow-xl shadow-stone-200/40 border border-stone-200/80 animate-pulse">
          {/* Tab bar */}
          <div className="flex rounded-full bg-[#F5F2EB] p-1 mb-8">
            <div className="flex-1 h-9 rounded-full bg-stone-200" />
            <div className="flex-1 h-9 rounded-full bg-stone-100 ml-1" />
          </div>
          {/* Fields */}
          <div className="space-y-4">
            <div>
              <div className="h-3 w-8 bg-stone-200 rounded mb-1.5" />
              <div className="h-12 bg-stone-50 rounded-2xl border border-stone-200" />
            </div>
            <div>
              <div className="h-3 w-14 bg-stone-200 rounded mb-1.5" />
              <div className="h-12 bg-stone-50 rounded-2xl border border-stone-200" />
            </div>
          </div>
          {/* Button */}
          <div className="mt-6 h-12 bg-stone-900 rounded-2xl" />
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
