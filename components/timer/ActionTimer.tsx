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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'

interface ActionTimerProps {
  goal?: string;
  taskId?: string;
  actions?: EditableAction[];
  onSessionComplete?: (session: TimerSession) => void;
  onShowSoundSettings?: () => void;
}

export function ActionTimer({ goal = 'Focus Session', taskId, actions = [], onSessionComplete, onShowSoundSettings }: ActionTimerProps) {
  const router = useRouter()
  const { state: actionSessionState, setCurrentAction, markActionAsCompleted, unmarkActionAsCompleted, updateTimeSpent, startActionSession } = useActionSession()
  
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
  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
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

  useEffect(() => {
    if (actionSessionState.actions.length > 0 && !currentAction) {
      setCurrentActionLocal(actionSessionState.actions[0])
      setCurrentAction(actionSessionState.actions[0].id)
      setCurrentActionIndex(0)
    }
  }, [actionSessionState.actions, currentAction, setCurrentAction])

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
    
    if (actionContext) {
      const index = actionSessionState.actions.findIndex(a => a.id === actionContext.id)
      setCurrentActionIndex(index)
      setCurrentActionLocal(actionContext)
      setCurrentAction(actionContext.id)
    }

    setShowLauncher(false)
    setSessionStartTime(now)
    pausedTimeRef.current = 0 // Reset paused time tracking
    actionStartTimeRef.current = now // Track action start time
    
    // Start ticking sound
    soundManager.startTicking()
  }, [setCurrentAction, actionSessionState.actions])

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

  const handleNextAction = useCallback(() => {
    const nextIndex = currentActionIndex + 1;
    if (nextIndex < actionSessionState.actions.length) {
      const nextAction = actionSessionState.actions[nextIndex];
      startTimer(nextAction.estimatedMinutes || 15, nextAction);
    } else {
      // Last action finished, go to results
      stopTimer();
    }
  }, [currentActionIndex, actionSessionState.actions, startTimer, stopTimer]);

  const handlePreviousAction = useCallback(() => {
    const prevIndex = currentActionIndex - 1;
    if (prevIndex >= 0) {
      const prevAction = actionSessionState.actions[prevIndex];
      startTimer(prevAction.estimatedMinutes || 15, prevAction);
    }
  }, [currentActionIndex, actionSessionState.actions, startTimer]);
  
  const handleToggleActionCompletion = useCallback(async (actionId: string) => {
    const isCompleted = actionSessionState.completedActionIds.has(actionId)
    if (isCompleted) {
      await unmarkActionAsCompleted(actionId)
    } else {
      const action = actionSessionState.actions.find(a => a.id === actionId)
      if (action) {
        let timeSpent = action.estimatedMinutes || 0
        if (action.id === currentAction?.id && timerState.isActive) {
          const adjustedElapsed = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
          timeSpent = Math.ceil(adjustedElapsed / 60)
        }
        await markActionAsCompleted(actionId, timeSpent)
      }
    }
  }, [actionSessionState.completedActionIds, actionSessionState.actions, currentAction, timerState, markActionAsCompleted, unmarkActionAsCompleted]);

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
        if (currentAction) {
            const actionTimeSpent = Math.ceil(
                calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
            );
            markActionAsCompleted(currentAction.id, actionTimeSpent);
        }

        setShowCompletionDialog(true);
      }
    }

    const interval = setInterval(checkCompletion, 1000)
    return () => clearInterval(interval)
  }, [timerState.isActive, timerState.isPaused, timerState.startTime, timerState.duration, timerState.plannedDuration, goal, taskId, router, onSessionComplete, currentAction, markActionAsCompleted, updateTimeSpent, sessionStartTime, setCurrentAction, handleNextAction])

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

  const addMoreTime = () => {
    setShowCompletionDialog(false);
    const newDuration = timerState.duration + 5 * 60; // Add 5 minutes
    const remaining = newDuration - calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current);

    setTimerState(prev => ({
        ...prev,
        duration: newDuration,
        remaining: remaining,
        isPaused: false,
    }));
    soundManager.startTicking();
  };

  const completeAndContinue = () => {
      setShowCompletionDialog(false);
      handleNextAction();
  };


  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {showLauncher ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <TimerLauncher 
            onSelectDuration={startTimer} 
            actions={actionSessionState.actions.length > 0 ? actionSessionState.actions : actions}
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

          {/* Action List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Actions</h3>
            <ul className="space-y-2">
              {actionSessionState.actions.map((action, index) => (
                <li key={action.id} className={`flex items-center p-2 rounded-lg ${currentActionIndex === index ? 'bg-blue-100' : ''}`}>
                  <Checkbox
                    id={`action-${action.id}`}
                    checked={actionSessionState.completedActionIds.has(action.id)}
                    onCheckedChange={() => handleToggleActionCompletion(action.id)}
                    className="mr-3"
                  />
                  <label htmlFor={`action-${action.id}`} className="flex-grow text-sm text-gray-800">
                    {action.text} ({action.estimatedMinutes}m)
                  </label>
                </li>
              ))}
            </ul>
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
            <div className="flex justify-center gap-4 mt-4">
                <button onClick={handlePreviousAction} disabled={currentActionIndex === 0} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Previous</button>
                <button onClick={() => {
                    if(currentAction) {
                        handleToggleActionCompletion(currentAction.id);
                        handleNextAction();
                    }
                }} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Finish Action</button>
                <button onClick={handleNextAction} disabled={currentActionIndex >= actionSessionState.actions.length - 1} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Next</button>
            </div>
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
       <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your time for this action is over. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCompletionDialog(false)}>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={addMoreTime}>Add 5 minutes</AlertDialogAction>
            <AlertDialogAction onClick={completeAndContinue}>Continue to Next Action</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}