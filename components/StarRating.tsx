'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState(0)

  const sizes = { sm: 'w-3 h-3', md: 'w-5 h-5', lg: 'w-6 h-6' }
  const iconSize = sizes[size]

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (hovered || value) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <Star
              className={`${iconSize} transition-colors ${
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
