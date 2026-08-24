'use client'

import type { Traveler } from '@/lib/types'

interface Props {
  count: number
  travelers: Traveler[]
  onChange: (travelers: Traveler[]) => void
  onNext: () => void
  onBack: () => void
}

import BookingProgress from '@/components/booking/BookingProgress'

export default function BookingStepTravelers({ count, travelers, onChange, onNext, onBack }: Props) {
  const rows: Traveler[] = Array.from({ length: count }, (_, i) => travelers[i] ?? { fullName: '', gender: '', birthDate: '', nationality: '', passportNumber: '', passportExpiry: '' })

  const update = (i: number, field: keyof Traveler, value: string) => {
    const updated = [...rows]
    updated[i] = { ...updated[i], [field]: value }
    onChange(updated)
  }

  const validate = () => rows.every(t => t.fullName.trim().length >= 2)

  const handleNext = () => {
    if (!validate()) return
    onNext()
  }

  return (
    <div className="space-y-6">
      <BookingProgress currentStep={2} />

      <div className="space-y-4">
        {rows.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border border-black/[0.06] p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Traveler {i + 1}</p>

            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-700">Nama Lengkap <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={t.fullName}
                onChange={e => update(i, 'fullName', e.target.value)}
                placeholder="Nama sesuai paspor/KTP"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${!t.fullName.trim() ? 'border-black/10 focus:border-black' : 'border-black/10 focus:border-black'}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Jenis Kelamin</label>
                <select
                  value={t.gender ?? ''}
                  onChange={e => update(i, 'gender', e.target.value)}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black bg-white"
                >
                  <option value="">Pilih</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Tanggal Lahir</label>
                <input
                  type="date"
                  value={t.birthDate ?? ''}
                  onChange={e => update(i, 'birthDate', e.target.value)}
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">Kewarganegaraan</label>
                <input
                  type="text"
                  value={t.nationality ?? ''}
                  onChange={e => update(i, 'nationality', e.target.value)}
                  placeholder="cth: Indonesia"
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700">No. Paspor (opsional)</label>
                <input
                  type="text"
                  value={t.passportNumber ?? ''}
                  onChange={e => update(i, 'passportNumber', e.target.value)}
                  placeholder="A1234567"
                  className="w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!rows.every(t => t.fullName.trim().length >= 2) && (
        <p className="text-xs text-red-500 text-center">Nama lengkap semua traveler wajib diisi</p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-black/10 text-black font-semibold py-3.5 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
        >
          Kembali
        </button>
        <button
          onClick={handleNext}
          disabled={!rows.every(t => t.fullName.trim().length >= 2)}
          className="flex-1 bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Lanjut ke Review
        </button>
      </div>
    </div>
  )
}
