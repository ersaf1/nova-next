'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Apple, Play } from 'lucide-react'

const AppCtaSection: React.FC = () => {
  const router = useRouter()
  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-[88rem] mx-auto">
        <div className="bg-[#1A1A2E] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="p-12 md:p-16 flex flex-col justify-between">
              <div>
                <p className="text-white/50 text-sm font-medium tracking-widest uppercase mb-4">Download the app</p>
                <h2 className="text-white text-4xl md:text-5xl font-medium leading-tight mb-6" style={{ letterSpacing: '-0.03em' }}>Your world in<br />your pocket.</h2>
                <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-sm">Plan trips, manage bookings, access offline maps, and chat with your concierge — all from the NOVA app.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-3 bg-white text-black px-6 py-3.5 rounded-2xl hover:bg-gray-100 transition-colors duration-200 font-medium"
                  >
                    <Apple className="w-5 h-5 shrink-0" />
                    <div className="text-left">
                      <span className="text-xs text-black/50 block leading-none mb-0.5">Download on the</span>
                      <span className="text-sm font-medium leading-none">App Store</span>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-3 bg-white/10 border border-white/20 text-white px-6 py-3.5 rounded-2xl hover:bg-white/20 transition-colors duration-200 font-medium"
                  >
                    <Play className="w-5 h-5 shrink-0 fill-white" />
                    <div className="text-left">
                      <span className="text-xs text-white/50 block leading-none mb-0.5">Get it on</span>
                      <span className="text-sm font-medium leading-none">Google Play</span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-white/40 text-sm mb-3">Join the waitlist for early access</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="your@email.com" className="flex-1 bg-white/10 border border-white/20 text-white placeholder-white/30 text-sm px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30" />
                  <button className="bg-white text-black text-sm font-medium px-5 py-3 rounded-xl hover:bg-white/90 transition-colors duration-200 shrink-0">Join</button>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block bg-gradient-to-br from-indigo-900 to-purple-900 min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A2E] via-transparent to-transparent" />
              <div className="absolute bottom-10 right-10 flex flex-col gap-3">
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 text-right">
                  <span className="text-white text-2xl font-medium block" style={{ letterSpacing: '-0.03em' }}>4.9★</span>
                  <span className="text-white/50 text-xs">150K reviews</span>
                </div>
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3 text-right">
                  <span className="text-white text-2xl font-medium block" style={{ letterSpacing: '-0.03em' }}>2M+</span>
                  <span className="text-white/50 text-xs">downloads</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppCtaSection
