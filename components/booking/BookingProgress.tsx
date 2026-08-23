import { Check } from 'lucide-react'

const STEPS = [
  { num: 1, label: 'Detail' },
  { num: 2, label: 'Review' },
  { num: 3, label: 'Pembayaran' },
]

export default function BookingProgress({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto">
      {STEPS.map((step, i) => {
        const done = step.num < currentStep
        const active = step.num === currentStep
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                done ? 'bg-black text-white' : active ? 'bg-black text-white ring-4 ring-black/10' : 'bg-neutral-100 text-neutral-400',
              ].join(' ')}>
                {done ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${active ? 'text-black' : done ? 'text-neutral-500' : 'text-neutral-300'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-10 sm:w-16 mb-4 mx-1 transition-all duration-300 ${done ? 'bg-black' : 'bg-neutral-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
