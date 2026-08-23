'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabaseClient } from '@/lib/supabase-client'
import { formatIDR } from '@/lib/types'
import type { PackageDeparture } from '@/lib/types'
import BookingProgress from '@/components/booking/BookingProgress'

interface ContactForm {
  contactName: string
  contactEmail: string
  contactPhone: string
  participants: number
}

interface FormErrors {
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  participants?: string
}

interface PackageInfo {
  id: number
  title: string
  image?: string
  coverImage?: string
  slug?: string
}

interface Props {
  pkg: PackageInfo
  departure: PackageDeparture
  onNext: (form: ContactForm) => void
}

export default function BookingStepDetails({ pkg, departure, onNext }: Props) {
  const [form, setForm] = useState<ContactForm>({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    participants: 1,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Pre-fill from session
  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data.user) {
        setForm(prev => ({
          ...prev,
          contactEmail: data.user?.email ?? prev.contactEmail,
          contactName: (data.user?.user_metadata?.full_name as string) ?? prev.contactName,
        }))
      }
    })
  }, [])

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.contactName.trim()) errs.contactName = 'Nama wajib diisi'
    if (!form.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.contactEmail = 'Email tidak valid'
    if (!form.contactPhone.replace(/\D/g, '').match(/^\d{8,15}$/)) errs.contactPhone = 'Nomor telepon tidak valid (8-15 digit)'
    if (form.participants < 1) errs.participants = 'Minimal 1 peserta'
    if (form.participants > departure.remainingSlots) errs.participants = `Maksimal ${departure.remainingSlots} peserta (slot tersisa)`
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onNext(form)
  }

  const subtotal = departure.price * form.participants
  const serviceFee = 250000
  const total = subtotal + serviceFee

  return (
    <div className="space-y-6">
      <BookingProgress currentStep={1} />

      {/* Package + departure summary */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">Paket Dipilih</p>
        <div className="flex gap-4">
          {(pkg.coverImage ?? pkg.image) && (
            <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100">
              <Image src={(pkg.coverImage ?? pkg.image)!} alt={pkg.title} fill className="object-cover" sizes="80px" />
            </div>
          )}
          <div>
            <p className="font-semibold text-black text-sm">{pkg.title}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {formatDate(departure.startDate)} — {formatDate(departure.endDate)}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {departure.remainingSlots} slot tersisa
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Data Pemesan</p>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Nama Lengkap</label>
            <input
              type="text"
              value={form.contactName}
              onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))}
              placeholder="Nama sesuai identitas"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.contactName ? 'border-red-400 focus:border-red-500' : 'border-black/10 focus:border-black'}`}
            />
            {errors.contactName && <p className="text-xs text-red-500">{errors.contactName}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={e => setForm(p => ({ ...p, contactEmail: e.target.value }))}
              placeholder="email@example.com"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.contactEmail ? 'border-red-400 focus:border-red-500' : 'border-black/10 focus:border-black'}`}
            />
            {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Nomor Telepon</label>
            <input
              type="tel"
              value={form.contactPhone}
              onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
              placeholder="+62 8xx xxxx xxxx"
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.contactPhone ? 'border-red-400 focus:border-red-500' : 'border-black/10 focus:border-black'}`}
            />
            {errors.contactPhone && <p className="text-xs text-red-500">{errors.contactPhone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-neutral-700">Jumlah Peserta</label>
            <input
              type="number"
              min={1}
              max={departure.remainingSlots}
              value={form.participants}
              onChange={e => setForm(p => ({ ...p, participants: Math.max(1, parseInt(e.target.value) || 1) }))}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${errors.participants ? 'border-red-400 focus:border-red-500' : 'border-black/10 focus:border-black'}`}
            />
            {errors.participants && <p className="text-xs text-red-500">{errors.participants}</p>}
          </div>
        </div>

        {/* Price preview */}
        <div className="bg-neutral-50 rounded-2xl border border-black/[0.04] p-5 space-y-2 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>{formatIDR(departure.price)} × {form.participants} orang</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-neutral-400 text-xs">
            <span>Biaya layanan</span>
            <span>{formatIDR(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-black pt-2 border-t border-black/[0.06]">
            <span>Total</span>
            <span>{formatIDR(total)}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white font-semibold py-3.5 rounded-xl hover:bg-neutral-800 active:bg-neutral-950 transition-colors text-sm"
        >
          Lanjutkan ke Review
        </button>
      </form>
    </div>
  )
}
