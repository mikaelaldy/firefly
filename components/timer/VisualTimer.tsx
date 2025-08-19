'use client'

import { useEffect, useState } from 'react'
import { formatTime } from '@/lib/timer-utils'
import type { TimerState } from '@/types'

interface VisualTimerProps {
  timerState: TimerState;
}

export function VisualTimer({ timerState }: VisualTimerProps) {
  const [displayTime, setDisplayTime] = useState(timerState.remaining)

  // Update display time every second when timer is active
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) {
      setDisplayTime(timerState.remaining)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - timerState.startTime.getTime()) / 1000)
      const remaining = Math.max(0, timerState.duration - elapsed)
      setDisplayTime(remaining)
    }, 1000)

    return () => clearInterval(interval)
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration, timerState.remaining])

  // Calculate progress percentage for shrinking disc
  const progressPercentage = timerState.duration > 0 
    ? ((timerState.duration - displayTime) / timerState.duration) * 100 
    : 0



  // Calculate stroke-dasharray for circular progress
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Shrinking disc visual timer */}
      <div className="relative w-80 h-80">
        {/* Background circle */}
        <svg 
          className="w-full h-full transform -rotate-90" 
          viewBox="0 0 280 280"
        >
          {/* Background track */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke="rgb(229 231 235)" // gray-200
            strokeWidth="8"
            fill="transparent"
          />
          
          {/* Progress circle (shrinking disc effect) */}
          <circle
            cx="140"
            cy="140"
            r={radius}
            stroke={timerState.isActive && !timerState.isPaused ? "rgb(34 197 94)" : "rgb(156 163 175)"} // green-500 or gray-400
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center content with time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
            {formatTime(displayTime)}
          </div>
          
          <div className="text-lg text-gray-600 font-medium">
            {timerState.isActive && !timerState.isPaused ? 'Focus Time' : 
             timerState.isPaused ? 'Paused' : 'Ready'}
          </div>
          
          {/* Progress indicator */}
          <div className="mt-4 text-sm text-gray-500">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>
      </div>

      {/* Timer status indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          timerState.isActive && !timerState.isPaused 
            ? 'bg-green-500 animate-pulse' 
            : timerState.isPaused 
            ? 'bg-yellow-500' 
            : 'bg-gray-400'
        }`}></div>
        <span className="text-sm font-medium text-gray-600">
          {timerState.isActive && !timerState.isPaused ? 'Active' : 
           timerState.isPaused ? 'Paused' : 'Stopped'}
        </span>
      </div>
    </div>
  )
}