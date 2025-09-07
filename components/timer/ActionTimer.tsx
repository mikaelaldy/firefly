'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { VisualTimer } from './VisualTimer'
import { TimerControls } from './TimerControls'
import { TimerLauncher } from './TimerLauncher'
import { calculateVariance, minutesToSeconds, calculateAdjustedElapsed } from '@/lib/timer-utils'
import { saveSession } from '@/lib/supabase/client-sessions'
import { useActionSession } from '@/lib/action-sessions/context'
import { soundManager } from '@/lib/sound-utils'
import type { TimerState, TimerSession, EditableAction } from '@/types'

interface ActionTimerProps {
  goal?: string;
  taskId?: string;
  actions?: EditableAction[];
  onSessionComplete?: (session: TimerSession) => void;
  onShowSoundSettings?: () => void;
}

export function ActionTimer({ goal = 'Focus Session', taskId, actions = [], onSessionComplete, onShowSoundSettings }: ActionTimerProps) {
  const router = useRouter()
  const { state: actionSessionState, setCurrentAction, markActionAsCompleted, updateTimeSpent, startActionSession } = useActionSession()
  
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    duration: 0,
    remaining: 0,
    startTime: new Date(),
    plannedDuration: 0
  })

  const [showLauncher, setShowLauncher] = useState(true)
  const [currentAction, setCurrentActionLocal] = useState<EditableAction | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const pausedTimeRef = useRef<number>(0) // Track total paused time for drift correction
  const pauseStartRef = useRef<number>(0) // Track when pause started
  const actionStartTimeRef = useRef<Date | null>(null) // Track when current action started

  // Initialize action session when component mounts
  useEffect(() => {
    if (actions.length > 0 && goal && !actionSessionState.sessionId) {
      startActionSession(goal, actions)
    }
  }, [actions, goal, actionSessionState.sessionId, startActionSession])

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
    
    setCurrentActionLocal(actionContext || null)
    setCurrentAction(actionContext?.id || null)
    setShowLauncher(false)
    setSessionStartTime(now)
    pausedTimeRef.current = 0 // Reset paused time tracking
    actionStartTimeRef.current = now // Track action start time
    
    // Start ticking sound
    soundManager.startTicking()
  }, [setCurrentAction])

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

      // If we have a current action, mark it as completed with actual time spent
      if (currentAction && actionStartTimeRef.current) {
        const actionTimeSpent = Math.ceil(
          calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
        )
        await markActionAsCompleted(currentAction.id, actionTimeSpent)
      }

      // Update total session time spent
      if (sessionStartTime) {
        const totalSessionTime = Math.ceil(
          calculateAdjustedElapsed(sessionStartTime, pausedTimeRef.current) / 60
        )
        await updateTimeSpent(totalSessionTime)
      }

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
      
      setCurrentActionLocal(null)
      setCurrentAction(null)
      setShowLauncher(true)
      setSessionStartTime(null)
      pausedTimeRef.current = 0
      actionStartTimeRef.current = null

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
  }, [timerState, goal, taskId, router, onSessionComplete, currentAction, markActionAsCompleted, updateTimeSpent, sessionStartTime, setCurrentAction])

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
        
        // If we have a current action, mark it as completed with actual time spent
        if (currentAction && actionStartTimeRef.current) {
          const actionTimeSpent = Math.ceil(
            calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
          )
          await markActionAsCompleted(currentAction.id, actionTimeSpent)
        }

        // Update total session time spent
        if (sessionStartTime) {
          const totalSessionTime = Math.ceil(
            calculateAdjustedElapsed(sessionStartTime, pausedTimeRef.current) / 60
          )
          await updateTimeSpent(totalSessionTime)
        }

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
        setCurrentActionLocal(null)
        setCurrentAction(null)
        setShowLauncher(true)
        setSessionStartTime(null)
        pausedTimeRef.current = 0
        actionStartTimeRef.current = null

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
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration, timerState.plannedDuration, goal, taskId, router, onSessionComplete, currentAction, markActionAsCompleted, updateTimeSpent, sessionStartTime, setCurrentAction])

  // Update session progress in real-time
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused || !sessionStartTime) return

    const updateProgress = async () => {
      const totalSessionTime = Math.ceil(
        calculateAdjustedElapsed(sessionStartTime, pausedTimeRef.current) / 60
      )
      await updateTimeSpent(totalSessionTime)
    }

    // Update progress every 30 seconds during active timer
    const progressInterval = setInterval(updateProgress, 30000)
    return () => clearInterval(progressInterval)
  }, [timerState.isActive, timerState.isPaused, sessionStartTime, updateTimeSpent])

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

  // Get current action details
  const getCurrentActionDetails = () => {
    if (!currentAction) return null
    
    const isCompleted = actionSessionState.completedActionIds.has(currentAction.id)
    return {
      ...currentAction,
      isCompleted
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {showLauncher ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <TimerLauncher 
            onSelectDuration={startTimer} 
            actions={actions}
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
              {(() => {
                const actionDetails = getCurrentActionDetails()
                if (actionDetails) {
                  return (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 inline-block max-w-md">
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-purple-700 font-semibold text-sm">
                          Current Action ({actionDetails.estimatedMinutes}m)
                        </span>
                        {actionDetails.isCompleted && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <p className="text-purple-700 text-sm leading-relaxed">
                        {actionDetails.text}
                      </p>
                    </div>
                  )
                }
                return null
              })()}
            </div>
          </div>

          {/* Session Progress Indicator */}
          {actionSessionState.sessionId && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-800 font-semibold text-sm">Session Progress</h3>
                <span className="text-blue-600 text-sm">
                  {actionSessionState.completedActionIds.size} / {actionSessionState.actions.length} actions completed
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${actionSessionState.actions.length > 0 
                      ? (actionSessionState.completedActionIds.size / actionSessionState.actions.length) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-blue-600 mt-1">
                <span>Estimated: {actionSessionState.totalEstimatedTime}m</span>
                <span>Actual: {actionSessionState.actualTimeSpent}m</span>
              </div>
            </div>
          )}

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