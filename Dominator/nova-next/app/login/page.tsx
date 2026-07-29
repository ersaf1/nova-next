'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase-client'

type Tab = 'signin' | 'signup'

function mapError(message: string): string {
  if (!message) return 'Terjadi kesalahan. Silakan coba lagi.'
  if (message.includes('Invalid login credentials')) return 'Email atau password salah.'
  if (message.includes('User already registered') || message.includes('already registered') || message.includes('already exists')) return 'Email ini sudah terdaftar. Silakan pilih menu Sign In.'
  if (message.includes('Email not confirmed')) return 'Silakan periksa email Anda untuk konfirmasi akun.'
  if (message.includes('Password should be at least')) return 'Password minimal 6 karakter.'
  if (message.includes('rate limit') || message.includes('Rate limit')) return 'Terlalu banyak percobaan. Harap tunggu sebentar.'
  return message
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const isAdminLogin = redirect.startsWith('/admin')

  const [tab, setTab] = useState<Tab>('signin')
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

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) {
      setError(mapError(error.message))
      setLoading(false)
      return
    }

    // Hard navigation so proxy.ts reads the fresh Supabase session cookies
    window.location.href = redirect
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

    const { data, error } = await supabaseClient.auth.signUp({ email, password })
    if (error) {
      // Auto-fallback: If rate limit is hit, try signing in directly!
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many requests')) {
        const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password })
        if (!signInError && signInData?.session) {
          setSuccess('Akun sudah terdaftar! Masuk ke sistem...')
          setTimeout(() => {
            window.location.href = redirect
          }, 600)
          return
        }
        setError('Akun mungkin sudah terdaftar. Silakan beralih ke tab "Sign in" di atas untuk masuk.')
        setLoading(false)
        return
      }

      setError(mapError(error.message))
      setLoading(false)
      return
    }

    if (data.session) {
      setSuccess('Akun berhasil dibuat! Mengalihkan ke halaman dashboard...')
      setTimeout(() => {
        window.location.href = redirect
      }, 600)
    } else {
      setSuccess('Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi sebelum Sign In.')
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
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email)
    if (error) {
      setError(mapError(error.message))
    } else {
      setSuccess('Check your email for a reset link.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-6 py-24"
      style={{ letterSpacing: '-0.02em' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="mb-10 text-center">
          <span className="text-2xl font-semibold tracking-tight text-black">NOVA</span>
          <p className="mt-1 text-sm text-neutral-500">Your AI-powered travel companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          {/* Tabs — hide signup for admin login */}
          {!isAdminLogin && (
            <div className="flex rounded-full bg-[#F5F5F5] p-1 mb-8">
              {(['signin', 'signup'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${
                    tab === t
                      ? 'bg-black text-white'
                      : 'text-neutral-500 hover:text-black'
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
                <label htmlFor="email" className="block text-xs font-medium text-neutral-500 mb-1.5">
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
                  className="w-full rounded-xl border border-neutral-200 bg-[#F5F5F5] px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-neutral-500 mb-1.5">
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
                    className="w-full rounded-xl border border-neutral-200 bg-[#F5F5F5] px-4 py-3 pr-11 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition"
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
                    className="mt-1.5 text-xs text-neutral-400 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Confirm password — sign up only */}
              {tab === 'signup' && (
                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-medium text-neutral-500 mb-1.5">
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
                      className="w-full rounded-xl border border-neutral-200 bg-[#F5F5F5] px-4 py-3 pr-11 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Inline mismatch error */}
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">Passwords do not match.</p>
                  )}
                </div>
              )}
            </div>

            {/* Error / success banners */}
            {error && (
              <p className="mt-4 text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <p className="mt-4 text-xs text-green-700 bg-green-50 rounded-xl px-4 py-3">
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full bg-black text-white rounded-full py-3 text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading
                ? tab === 'signin' ? 'Signing in…' : 'Creating account…'
                : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {/* No guest checkout allowed */}
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
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
      className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-6 py-24"
      style={{ letterSpacing: '-0.02em' }}
    >
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-10 text-center">
          <span className="text-2xl font-semibold tracking-tight text-black">NOVA</span>
          <p className="mt-1 text-sm text-neutral-500">Your AI-powered travel companion</p>
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
          {/* Tab bar */}
          <div className="flex rounded-full bg-[#F5F5F5] p-1 mb-8">
            <div className="flex-1 h-9 rounded-full bg-neutral-200" />
            <div className="flex-1 h-9 rounded-full bg-neutral-100 ml-1" />
          </div>
          {/* Fields */}
          <div className="space-y-4">
            <div>
              <div className="h-3 w-8 bg-neutral-200 rounded mb-1.5" />
              <div className="h-12 bg-[#F5F5F5] rounded-xl border border-neutral-200" />
            </div>
            <div>
              <div className="h-3 w-14 bg-neutral-200 rounded mb-1.5" />
              <div className="h-12 bg-[#F5F5F5] rounded-xl border border-neutral-200" />
            </div>
          </div>
          {/* Button */}
          <div className="mt-6 h-12 bg-neutral-200 rounded-full" />
          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200" />
            <div className="h-3 w-4 bg-neutral-200 rounded" />
            <div className="flex-1 h-px bg-neutral-200" />
          </div>
          {/* Guest button */}
          <div className="h-12 border border-neutral-200 rounded-full bg-neutral-50" />
        </div>

        <p className="mt-6 text-center text-xs text-neutral-400">
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
