'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { VisualTimer } from './VisualTimer'
import { TimerControls } from './TimerControls'
import { soundManager, breakManager, formatBreakMessage, getBreakSuggestions, type BreakSession } from '@/lib/sound-utils'
import { calculateAdjustedElapsed, minutesToSeconds } from '@/lib/timer-utils'
import type { TimerState } from '@/types'

interface BreakTimerProps {
  breakSession: BreakSession
  onBreakComplete: () => void
  onSkipBreak: () => void
}

export function BreakTimer({ breakSession, onBreakComplete, onSkipBreak }: BreakTimerProps) {
  const router = useRouter()
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    duration: 0,
    remaining: 0,
    startTime: new Date(),
    plannedDuration: 0
  })

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const pausedTimeRef = useState<number>(0)[0]

  const suggestions = getBreakSuggestions(breakSession.type)

  // Start break timer
  const startBreakTimer = useCallback(() => {
    const durationInSeconds = minutesToSeconds(breakSession.duration)
    const now = new Date()
    
    setTimerState({
      isActive: true,
      isPaused: false,
      duration: durationInSeconds,
      remaining: durationInSeconds,
      startTime: now,
      plannedDuration: durationInSeconds
    })
    
    setHasStarted(true)
    soundManager.playSound('break-start')
  }, [breakSession.duration])

  // Pause break timer
  const pauseTimer = useCallback(() => {
    if (timerState.isActive && !timerState.isPaused) {
      setTimerState(prev => ({ ...prev, isPaused: true }))
    }
  }, [timerState.isActive, timerState.isPaused])

  // Resume break timer
  const resumeTimer = useCallback(() => {
    if (timerState.isActive && timerState.isPaused) {
      setTimerState(prev => ({ ...prev, isPaused: false }))
    }
  }, [timerState.isActive, timerState.isPaused])

  // Complete break
  const completeBreak = useCallback(() => {
    soundManager.playSound('break-end')
    onBreakComplete()
  }, [onBreakComplete])

  // Handle timer completion
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) return

    const checkCompletion = () => {
      const adjustedElapsed = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef)
      const remaining = Math.max(0, timerState.duration - adjustedElapsed)

      if (remaining === 0) {
        completeBreak()
      }
    }

    const interval = setInterval(checkCompletion, 1000)
    return () => clearInterval(interval)
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration, completeBreak, pausedTimeRef])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && timerState.isActive) {
        event.preventDefault()
        if (timerState.isPaused) {
          resumeTimer()
        } else {
          pauseTimer()
        }
      } else if (event.code === 'Escape') {
        event.preventDefault()
        onSkipBreak()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [timerState.isActive, timerState.isPaused, pauseTimer, resumeTimer, onSkipBreak])

  const breakMessage = formatBreakMessage(breakSession)
  const nextBreakInfo = breakManager.getNextBreakInfo()

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {!hasStarted ? (
          // Break announcement screen
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                breakSession.type === 'long' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {breakSession.type === 'long' ? (
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {breakSession.type === 'long' ? 'Long Break Time!' : 'Break Time!'}
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
                  {breakMessage}
                </p>
              </div>
            </div>

            {/* Break suggestions */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Break Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${showSuggestions ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              
              {showSuggestions && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="text-sm text-gray-700 bg-white rounded-lg px-3 py-2 border border-gray-200"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Session progress info */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-purple-800">Sessions Completed</div>
                  <div className="text-2xl font-bold text-purple-600">{breakSession.sessionCount}</div>
                </div>
                <div className="w-px h-8 bg-purple-200"></div>
                <div className="text-center">
                  <div className="font-semibold text-purple-800">Next Break</div>
                  <div className="text-sm text-purple-600">
                    {nextBreakInfo.duration}min {nextBreakInfo.type}
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={startBreakTimer}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Start {breakSession.duration}-Minute Break
              </button>
              <button
                onClick={onSkipBreak}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Skip Break
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Press Space to start/pause • Press Escape to skip
            </div>
          </div>
        ) : (
          // Break timer screen
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {breakSession.type === 'long' ? 'Long Break' : 'Break Time'}
              </h2>
              <p className="text-gray-600">
                Relax and recharge for {breakSession.duration} minutes
              </p>
            </div>

            {/* Visual Timer */}
            <VisualTimer timerState={timerState} totalPausedTime={pausedTimeRef} />

            {/* Timer Controls */}
            <div className="mt-8">
              <TimerControls
                timerState={timerState}
                onPause={pauseTimer}
                onResume={resumeTimer}
                onStop={completeBreak}
                stopLabel="End Break Early"
              />
            </div>

            {/* Break suggestions (collapsed) */}
            <div className="bg-gray-50 rounded-xl p-4">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-gray-700">
                  Break Ideas {showSuggestions ? '(tap to hide)' : '(tap to show)'}
                </span>
                <svg 
                  className={`w-4 h-4 text-gray-500 transform transition-transform ${showSuggestions ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSuggestions && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="text-xs text-gray-600 bg-white rounded px-2 py-1 border border-gray-200"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}