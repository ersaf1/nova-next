import React from 'react'

interface LogoIconProps {
  className?: string
}

const LogoIcon: React.FC<LogoIconProps> = ({ className = 'w-9 h-9' }) => {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs border border-black/10 shrink-0 select-none ${className}`}
    >
      {/* Minimalist Compass Star Icon */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1.5 text-white"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.25"
          strokeDasharray="2 2"
        />
        <path
          d="M12 3L14.2 9.8L21 12L14.2 14.2L12 21L9.8 14.2L3 12L9.8 9.8L12 3Z"
          fill="currentColor"
        />
      </svg>
    </div>
  )
}

export default LogoIcon
