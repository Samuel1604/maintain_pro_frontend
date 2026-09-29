import React from 'react'
import { getTimeGreeting } from '@/utils/timeGreeting'

interface HandWaveGreetingProps {
  userName?: string
  className?: string
  subtext?: string
}

/**
 * HandWaveGreeting component:
 * Renders a location-time based greeting ("Good morning", "Good afternoon", "Good evening", "Good night")
 * alongside an animated waving hand gesture.
 */
export function HandWaveGreeting({ userName, className, subtext }: HandWaveGreetingProps) {
  const { greeting } = getTimeGreeting(userName)

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-[#0f172a] sm:text-2xl">
          {greeting}
        </h1>
        <span
          className="inline-block origin-[70%_70%] animate-wave text-xl sm:text-2xl"
          role="img"
          aria-label="waving hand"
        >
          👋
        </span>
      </div>
      {subtext && (
        <p className="mt-1 text-[13px] text-[#64748b]">{subtext}</p>
      )}
    </div>
  )
}
