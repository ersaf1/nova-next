import React from 'react'
import Image from 'next/image'

interface LogoIconProps {
  className?: string
}

const LogoIcon: React.FC<LogoIconProps> = ({ className = '' }) => {
  return (
    <Image
      src="/nova_official_logo.png"
      alt="Nova logo"
      width={56}
      height={56}
      className={className}
      priority
    />
  )
}

export default LogoIcon
