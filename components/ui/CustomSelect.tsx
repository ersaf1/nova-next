'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  id: string
  label: string
  icon?: React.ReactNode | string
  desc?: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  icon?: React.ReactNode
  className?: string
  buttonClassName?: string
  dropdownClassName?: string
  align?: 'left' | 'right'
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Pilih opsi...',
  icon,
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  align = 'left',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.id === value)

  // Close on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full bg-white hover:bg-neutral-50/90 text-neutral-950 border border-neutral-200/90 hover:border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs font-jakarta font-bold flex items-center justify-between gap-2.5 transition-all duration-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-neutral-950/15 active:scale-[0.98] cursor-pointer ${
          isOpen ? 'ring-2 ring-neutral-950/15 border-neutral-400 bg-neutral-50' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {icon && <span className="text-neutral-500 shrink-0">{icon}</span>}
          {selectedOption?.icon && typeof selectedOption.icon === 'string' ? (
            <span className="text-sm shrink-0">{selectedOption.icon}</span>
          ) : (
            selectedOption?.icon
          )}
          <span className="truncate text-neutral-900 font-bold">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-900' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute z-50 mt-1.5 w-full min-w-[200px] max-h-72 overflow-y-auto bg-white/95 backdrop-blur-xl border border-neutral-200/90 rounded-2xl p-1.5 shadow-xl shadow-neutral-950/10 animate-fade-in focus:outline-none ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${dropdownClassName}`}
          style={{ animationDuration: '150ms' }}
        >
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = option.id === value
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-jakarta flex items-center justify-between gap-2.5 transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? 'bg-brand text-white font-bold shadow-2xs'
                      : 'text-neutral-700 hover:bg-neutral-100/80 hover:text-neutral-950 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {option.icon && typeof option.icon === 'string' ? (
                      <span className="text-sm shrink-0">{option.icon}</span>
                    ) : (
                      option.icon
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold leading-snug">{option.label}</p>
                      {option.desc && (
                        <p
                          className={`text-[10px] truncate leading-tight mt-0.5 ${
                            isSelected ? 'text-white/70' : 'text-neutral-400'
                          }`}
                        >
                          {option.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check size={14} className="text-white shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}