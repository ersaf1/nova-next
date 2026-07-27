'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

type Tab = 'signin' | 'signup'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Set cookie for proxy (middleware) to read
    const token = data.session?.access_token
    if (token) {
      document.cookie = `sb-access-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
    }

    router.push(redirect)
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = await supabaseClient.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess('Account created! Check your email to confirm your address before signing in.')
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
          {/* Tabs */}
          <div className="flex rounded-full bg-[#F5F5F5] p-1 mb-8">
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null) }}
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

          {/* Form */}
          <form onSubmit={tab === 'signin' ? handleSignIn : handleSignUp} noValidate>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-neutral-500 mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-neutral-200 bg-[#F5F5F5] px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-neutral-500 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-200 bg-[#F5F5F5] px-4 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Error / success */}
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

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400">or</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Guest */}
          <button
            onClick={() => router.push('/booking')}
            className="w-full border border-neutral-200 text-black rounded-full py-3 text-sm font-medium hover:bg-[#F5F5F5] transition"
          >
            Continue as guest
          </button>
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
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center"><span className="text-sm text-neutral-400">Loading…</span></div>}>
      <LoginForm />
    </Suspense>
  )
}