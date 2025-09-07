'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { VisualTimer } from './VisualTimer'
import { TimerControls } from './TimerControls'
import { TimerLauncher } from './TimerLauncher'
import { ActionTimer } from './ActionTimer'
import { BreakTimer } from './BreakTimer'
import { SoundSettings } from '../SoundSettings'
import { calculateVariance, minutesToSeconds, calculateAdjustedElapsed } from '@/lib/timer-utils'
import { saveSession } from '@/lib/supabase/client-sessions'
import { soundManager, breakManager, type BreakSession } from '@/lib/sound-utils'
import type { TimerState, TimerSession, EditableAction } from '@/types'

interface TimerProps {
  goal?: string;
  taskId?: string;
  actions?: EditableAction[];
  onSessionComplete?: (session: TimerSession) => void;
}

export function Timer({ goal = 'Focus Session', taskId, actions = [], onSessionComplete }: TimerProps) {
  const [currentBreak, setCurrentBreak] = useState<BreakSession | null>(null)
  const [showSoundSettings, setShowSoundSettings] = useState(false)

  // Handle session completion and break management
  const handleSessionComplete = useCallback((session: TimerSession) => {
    // Play completion sound
    soundManager.playSound('alarm')
    
    // Determine if a break should be offered
    const breakSession = breakManager.completeSession()
    
    if (breakSession) {
      setCurrentBreak(breakSession)
    } else {
      // No break needed, proceed normally
      onSessionComplete?.(session)
    }
  }, [onSessionComplete])

  // Handle break completion
  const handleBreakComplete = useCallback(() => {
    setCurrentBreak(null)
    // Return to timer launcher for next session
  }, [])

  // Handle break skip
  const handleSkipBreak = useCallback(() => {
    setCurrentBreak(null)
    // Return to timer launcher for next session
  }, [])

  // Show break timer if we have an active break
  if (currentBreak) {
    return (
      <BreakTimer
        breakSession={currentBreak}
        onBreakComplete={handleBreakComplete}
        onSkipBreak={handleSkipBreak}
      />
    )
  }

  // Use ActionTimer when we have actions, otherwise use regular timer
  if (actions.length > 0) {
    return (
      <>
        <ActionTimer 
          goal={goal}
          taskId={taskId}
          actions={actions}
          onSessionComplete={handleSessionComplete}
          onShowSoundSettings={() => setShowSoundSettings(true)}
        />
        <SoundSettings 
          isOpen={showSoundSettings} 
          onClose={() => setShowSoundSettings(false)} 
        />
      </>
    )
  }

  // Regular timer implementation for when no actions are provided
  return (
    <>
      <RegularTimer 
        goal={goal} 
        taskId={taskId} 
        onSessionComplete={handleSessionComplete}
        onShowSoundSettings={() => setShowSoundSettings(true)}
      />
      <SoundSettings 
        isOpen={showSoundSettings} 
        onClose={() => setShowSoundSettings(false)} 
      />
    </>
  )
}

// Separate component for regular timer to avoid hooks issues
function RegularTimer({ 
  goal, 
  taskId, 
  onSessionComplete, 
  onShowSoundSettings 
}: { 
  goal: string; 
  taskId?: string; 
  onSessionComplete?: (session: TimerSession) => void;
  onShowSoundSettings?: () => void;
}) {
  const router = useRouter()
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    duration: 0,
    remaining: 0,
    startTime: new Date(),
    plannedDuration: 0
  })

  const [showLauncher, setShowLauncher] = useState(true)
  const [currentAction, setCurrentAction] = useState<EditableAction | null>(null)
  const pausedTimeRef = useRef<number>(0) // Track total paused time for drift correction
  const pauseStartRef = useRef<number>(0) // Track when pause started

  // Start timer with selected duration and optional action context
  const startTimer = useCallback((minutes: number, actionContext?: EditableAction) => {
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
    
    setCurrentAction(actionContext || null)
    setShowLauncher(false)
    pausedTimeRef.current = 0 // Reset paused time tracking
    
    // Start ticking sound
    soundManager.startTicking()
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
      
      // Stop ticking sound when paused
      soundManager.stopTicking()
    }
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration])

  // Resume timer with drift correction
  const resumeTimer = useCallback(() => {
    if (timerState.isActive && timerState.isPaused) {
      // Calculate how long we were paused and add to total paused time
      const pauseDuration = Date.now() - pauseStartRef.current
      pausedTimeRef.current += pauseDuration
      
      setTimerState(prev => ({ ...prev, isPaused: false }))
      
      // Resume ticking sound
      soundManager.startTicking()
    }
  }, [timerState.isActive, timerState.isPaused])

  // Stop timer and create session
  const stopTimer = useCallback(async () => {
    if (timerState.isActive) {
      const now = new Date()
      const actualDuration = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
      
      // Stop ticking sound
      soundManager.stopTicking()
      
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
      
      setCurrentAction(null)
      setShowLauncher(true)
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

    const checkCompletion = async () => {
      const adjustedElapsed = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
      const remaining = Math.max(0, timerState.duration - adjustedElapsed)

      if (remaining === 0) {
        // Stop ticking sound
        soundManager.stopTicking()
        
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
        setCurrentAction(null)
        setShowLauncher(true)
        pausedTimeRef.current = 0

        // Save session to database
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
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration, timerState.plannedDuration, goal, taskId, router, onSessionComplete])

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
      {showLauncher ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <TimerLauncher 
            onSelectDuration={startTimer} 
            actions={[]}
            showPresets={true}
            onShowSoundSettings={onShowSoundSettings}
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Goal and Action Context display */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Focus Session</h2>
            <div className="space-y-2">
              <p className="text-gray-600 bg-gray-50 rounded-lg px-4 py-2 inline-block">
                {goal}
              </p>
              {currentAction && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 inline-block max-w-md">
                  <div className="flex items-center space-x-2 mb-1">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-purple-700 font-semibold text-sm">
                      Current Action ({currentAction.estimatedMinutes}m)
                    </span>
                  </div>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    {currentAction.text}
                  </p>
                </div>
              )}
            </div>
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

          {/* Back to launcher button (when stopped) */}
          {!timerState.isActive && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowLauncher(true)}
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