'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { VisualTimer } from './VisualTimer'
import { TimerControls } from './TimerControls'
import { TimerPresets } from './TimerPresets'
import { calculateVariance, minutesToSeconds, calculateAdjustedElapsed } from '@/lib/timer-utils'
import { saveSession } from '@/lib/supabase/sessions'
import type { TimerState, TimerSession } from '@/types'

interface TimerProps {
  goal?: string;
  taskId?: string;
  onSessionComplete?: (session: TimerSession) => void;
}

export function Timer({ goal = 'Focus Session', taskId, onSessionComplete }: TimerProps) {
  const router = useRouter()
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    duration: 0,
    remaining: 0,
    startTime: new Date(),
    plannedDuration: 0
  })

  const [showPresets, setShowPresets] = useState(true)
  const pausedTimeRef = useRef<number>(0) // Track total paused time for drift correction
  const pauseStartRef = useRef<number>(0) // Track when pause started

  // Start timer with selected duration
  const startTimer = useCallback((minutes: number) => {
    const durationInSeconds = minutesToSeconds(minutes)
    const now = new Date()
    
    setTimerState({
      isActive: true,
      isPaused: false,
      duration: durationInSeconds,
      remaining: durationInSeconds,
      startTime: now,
      plannedDuration: durationInSeconds
    })
    
    setShowPresets(false)
    pausedTimeRef.current = 0 // Reset paused time tracking
  }, [])

  // Pause timer
  const pauseTimer = useCallback(() => {
    if (timerState.isActive && !timerState.isPaused) {
      pauseStartRef.current = Date.now()
      
      // Calculate current remaining time and store it
      const adjustedElapsed = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
      const remaining = Math.max(0, timerState.duration - adjustedElapsed)
      
      setTimerState(prev => ({ 
        ...prev, 
        isPaused: true,
        remaining: remaining
      }))
    }
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration])

  // Resume timer with drift correction
  const resumeTimer = useCallback(() => {
    if (timerState.isActive && timerState.isPaused) {
      // Calculate how long we were paused and add to total paused time
      const pauseDuration = Date.now() - pauseStartRef.current
      pausedTimeRef.current += pauseDuration
      
      setTimerState(prev => ({ ...prev, isPaused: false }))
    }
  }, [timerState.isActive, timerState.isPaused])

  // Stop timer and create session
  const stopTimer = useCallback(async () => {
    if (timerState.isActive) {
      const now = new Date()
      const actualDuration = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
      
      // Calculate variance using utility function
      const variance = calculateVariance(timerState.plannedDuration, actualDuration)

      const session: TimerSession = {
        id: crypto.randomUUID(),
        goal,
        plannedDuration: timerState.plannedDuration,
        actualDuration,
        completed: false, // Manually stopped
        startedAt: timerState.startTime,
        completedAt: now,
        variance
      }

      // Reset timer state
      setTimerState({
        isActive: false,
        isPaused: false,
        duration: 0,
        remaining: 0,
        startTime: new Date(),
        plannedDuration: 0
      })
      
      setShowPresets(true)
      pausedTimeRef.current = 0

      // Save session to database (non-blocking)
      try {
        await saveSession(session, taskId)
      } catch (error) {
        console.error('Failed to save session to database:', error)
        // Continue anyway - don't block user flow
      }

      // Store session in localStorage for results page
      localStorage.setItem(`session_${session.id}`, JSON.stringify(session))

      // Navigate to results page
      router.push(`/results?session=${session.id}`)

      // Notify parent component
      onSessionComplete?.(session)
    }
  }, [timerState, goal, taskId, router, onSessionComplete])

  // Handle timer completion
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) return

    const checkCompletion = () => {
      const adjustedElapsed = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
      const remaining = Math.max(0, timerState.duration - adjustedElapsed)

      if (remaining === 0) {
        // Timer completed naturally
        const session: TimerSession = {
          id: crypto.randomUUID(),
          goal,
          plannedDuration: timerState.plannedDuration,
          actualDuration: timerState.duration,
          completed: true,
          startedAt: timerState.startTime,
          completedAt: new Date(),
          variance: 0 // Perfect completion
        }

        setTimerState(prev => ({ ...prev, isActive: false }))
        setShowPresets(true)
        pausedTimeRef.current = 0

        // Save session to database (non-blocking)
        saveSession(session, taskId).catch(error => {
          console.error('Failed to save session to database:', error)
          // Continue anyway - don't block user flow
        })

        // Store session in localStorage for results page
        localStorage.setItem(`session_${session.id}`, JSON.stringify(session))

        // Navigate to results page
        router.push(`/results?session=${session.id}`)

        onSessionComplete?.(session)
      }
    }

    const interval = setInterval(checkCompletion, 1000)
    return () => clearInterval(interval)
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration, goal, onSessionComplete])

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
      } else if (event.code === 'Escape' && timerState.isActive) {
        event.preventDefault()
        stopTimer()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [timerState.isActive, timerState.isPaused, pauseTimer, resumeTimer, stopTimer])

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {showPresets ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <TimerPresets onSelectDuration={startTimer} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Goal display */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Focus Session</h2>
            <p className="text-gray-600 bg-gray-50 rounded-lg px-4 py-2 inline-block">
              {goal}
            </p>
          </div>

          {/* Visual Timer */}
          <VisualTimer timerState={timerState} totalPausedTime={pausedTimeRef.current} />

          {/* Timer Controls */}
          <div className="mt-8">
            <TimerControls
              timerState={timerState}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
            />
          </div>

          {/* Back to presets button (when stopped) */}
          {!timerState.isActive && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowPresets(true)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                ← Choose different duration
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}