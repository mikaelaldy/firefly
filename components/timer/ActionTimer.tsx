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
import { ActionCompletionModal } from './ActionCompletionModal'
import { TimerExtensionModal } from './TimerExtensionModal'
import { ActionNavigationModal } from './ActionNavigationModal'

interface ActionTimerProps {
  goal?: string;
  taskId?: string;
  actions?: EditableAction[];
  onSessionComplete?: (session: TimerSession) => void;
  onShowSoundSettings?: () => void;
}

export function ActionTimer({ goal = 'Focus Session', taskId, actions = [], onSessionComplete, onShowSoundSettings }: ActionTimerProps) {
  const router = useRouter()
  const { 
    state: actionSessionState, 
    setCurrentAction, 
    markActionAsCompleted, 
    unmarkActionAsCompleted, 
    updateTimeSpent, 
    startActionSession,
    completeSession,
    getSessionSummary,
    addTimeExtension
  } = useActionSession()
  
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
  const [showMarkCompleteModal, setShowMarkCompleteModal] = useState(false)
  const [showExtensionModal, setShowExtensionModal] = useState(false)
  const [showNavigationModal, setShowNavigationModal] = useState(false)
  const [navigationDirection, setNavigationDirection] = useState<'previous' | 'next'>('next')
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [currentActionExtensions, setCurrentActionExtensions] = useState<number[]>([])
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
    if (actionSessionState.actions.length > 0 && !currentAction && !timerState.isActive) {
      const firstUncompletedIndex = actionSessionState.actions.findIndex(
        (action) => !actionSessionState.completedActionIds.has(action.id)
      )

      const indexToStart = firstUncompletedIndex === -1 ? actionSessionState.actions.length - 1 : firstUncompletedIndex;
      
      if (indexToStart >= 0) {
        const actionToStart = actionSessionState.actions[indexToStart];
        setCurrentActionLocal(actionToStart)
        setCurrentAction(actionToStart.id)
        setCurrentActionIndex(indexToStart)

        // Keep launcher visible so user can start the first action
        // The launcher will show the action with its estimated time
      }
    }
  }, [actionSessionState.actions, actionSessionState.completedActionIds, currentAction, setCurrentAction, actionSessionState.sessionId, timerState.isActive])

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
    } else if (currentAction) {
      // If no action context provided but we have a current action, use it
      const index = actionSessionState.actions.findIndex(a => a.id === currentAction.id)
      setCurrentActionIndex(index)
    }

    setShowLauncher(false)
    setSessionStartTime(now)
    pausedTimeRef.current = 0 // Reset paused time tracking
    actionStartTimeRef.current = now // Track action start time
    
    // Start ticking sound
    soundManager.startTicking()
  }, [setCurrentAction, actionSessionState.actions, currentAction])

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

  // Handle session completion
  const handleSessionComplete = useCallback(async () => {
    try {
      // Stop any active timer
      if (timerState.isActive) {
        soundManager.stopTicking();
      }

      // Complete the session in the context
      await completeSession();

      // Generate session summary
      const sessionSummary = getSessionSummary();
      
      // Create a timer session for the results page
      const now = new Date();
      const totalSessionTime = sessionStartTime 
        ? calculateAdjustedElapsed(sessionStartTime, pausedTimeRef.current)
        : actionSessionState.actualTimeSpent * 60; // Convert minutes to seconds

      const session: TimerSession = {
        id: actionSessionState.sessionId || crypto.randomUUID(),
        goal: actionSessionState.goal || goal,
        plannedDuration: actionSessionState.totalEstimatedTime * 60, // Convert to seconds
        actualDuration: totalSessionTime,
        completed: true, // Session completed (not manually stopped)
        startedAt: sessionStartTime || new Date(Date.now() - totalSessionTime * 1000),
        completedAt: now,
        variance: calculateVariance(
          actionSessionState.totalEstimatedTime * 60, 
          totalSessionTime
        )
      };

      // Reset timer state
      setTimerState({
        isActive: false,
        isPaused: false,
        duration: 0,
        remaining: 0,
        startTime: new Date(),
        plannedDuration: 0
      });
      
      setCurrentActionLocal(null);
      setCurrentAction(null);
      setShowLauncher(true);
      setSessionStartTime(null);
      pausedTimeRef.current = 0;
      actionStartTimeRef.current = null;

      // Save session to database (non-blocking)
      try {
        await saveSession(session, taskId);
      } catch (error) {
        console.error('Failed to save session to database:', error);
        // Continue anyway - don't block user flow
      }

      // Store session and summary in localStorage for results page
      localStorage.setItem(`session_${session.id}`, JSON.stringify(session));
      if (sessionSummary) {
        localStorage.setItem(`session_summary_${session.id}`, JSON.stringify(sessionSummary));
      }

      // Store detailed action-level progress data
      const actionProgressData = {
        sessionId: session.id,
        actions: actionSessionState.actions.map(action => ({
          id: action.id,
          text: action.text,
          estimatedMinutes: action.estimatedMinutes,
          actualMinutes: action.actualMinutes,
          status: action.status,
          timeExtensions: action.timeExtensions || [],
          completedAt: action.completedAt,
          skippedAt: action.skippedAt
        })),
        completionStats: actionSessionState.completionStats,
        summary: sessionSummary
      };
      
      localStorage.setItem(`action_progress_${session.id}`, JSON.stringify(actionProgressData));

      // Navigate to results page
      router.push(`/results?session=${session.id}`);

      // Notify parent component
      onSessionComplete?.(session);

    } catch (error) {
      console.error('Error completing session:', error);
      // Fallback: just navigate to results with basic session data
      const now = new Date();
      const totalSessionTime = sessionStartTime 
        ? calculateAdjustedElapsed(sessionStartTime, pausedTimeRef.current)
        : actionSessionState.actualTimeSpent * 60;

      const fallbackSession: TimerSession = {
        id: actionSessionState.sessionId || crypto.randomUUID(),
        goal: actionSessionState.goal || goal,
        plannedDuration: actionSessionState.totalEstimatedTime * 60,
        actualDuration: totalSessionTime,
        completed: true,
        startedAt: sessionStartTime || new Date(Date.now() - totalSessionTime * 1000),
        completedAt: now,
        variance: calculateVariance(actionSessionState.totalEstimatedTime * 60, totalSessionTime)
      };

      localStorage.setItem(`session_${fallbackSession.id}`, JSON.stringify(fallbackSession));
      router.push(`/results?session=${fallbackSession.id}`);
    }
  }, [
    timerState.isActive, 
    completeSession,
    getSessionSummary,
    actionSessionState.sessionId,
    actionSessionState.goal,
    actionSessionState.totalEstimatedTime,
    actionSessionState.actualTimeSpent,
    actionSessionState.actions,
    actionSessionState.completionStats,
    sessionStartTime, 
    goal, 
    taskId, 
    router, 
    onSessionComplete, 
    setCurrentAction
  ]);

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

  const handleNextAction = useCallback(async () => {
    const nextIndex = currentActionIndex + 1;
    
    // Check if session is complete (all actions completed or skipped)
    const isComplete = actionSessionState.isSessionComplete;
    
    if (isComplete) {
      // Session is complete, generate summary and navigate to results
      await handleSessionComplete();
      return;
    }
    
    if (nextIndex < actionSessionState.actions.length) {
      // Find next uncompleted action
      const nextUncompletedIndex = actionSessionState.actions.findIndex(
        (action, index) => index >= nextIndex && !actionSessionState.completedActionIds.has(action.id)
      );
      
      if (nextUncompletedIndex !== -1) {
        const nextAction = actionSessionState.actions[nextUncompletedIndex];
        setCurrentActionIndex(nextUncompletedIndex);
        startTimer(nextAction.estimatedMinutes || 15, nextAction);
      } else {
        // No more uncompleted actions, session is complete
        await handleSessionComplete();
      }
    } else {
      // Reached end of actions list, session is complete
      await handleSessionComplete();
    }
  }, [currentActionIndex, actionSessionState.actions, actionSessionState.isSessionComplete, actionSessionState.completedActionIds, startTimer, handleSessionComplete]);

  const handlePreviousAction = useCallback(() => {
    const prevIndex = currentActionIndex - 1;
    if (prevIndex >= 0) {
      const prevAction = actionSessionState.actions[prevIndex];
      startTimer(prevAction.estimatedMinutes || 15, prevAction);
    }
  }, [currentActionIndex, actionSessionState.actions, startTimer]);

  // Handle navigation with confirmation when timer is active
  const handleNavigationClick = useCallback((direction: 'previous' | 'next') => {
    if (timerState.isActive && !timerState.isPaused) {
      // Show confirmation modal if timer is running
      setNavigationDirection(direction)
      setShowNavigationModal(true)
    } else {
      // Direct navigation if timer is not active
      if (direction === 'next') {
        handleNextAction()
      } else {
        handlePreviousAction()
      }
    }
  }, [timerState.isActive, timerState.isPaused, handleNextAction, handlePreviousAction])

  // Handle confirmed navigation
  const handleConfirmedNavigation = useCallback(() => {
    // Pause the current timer first
    if (timerState.isActive) {
      pauseTimer()
    }
    
    setShowNavigationModal(false)
    
    // Navigate to the target action
    if (navigationDirection === 'next') {
      handleNextAction()
    } else {
      handlePreviousAction()
    }
  }, [timerState.isActive, pauseTimer, navigationDirection, handleNextAction, handlePreviousAction])
  
  const handleToggleActionCompletion = useCallback(async (actionId: string) => {
    const isCompleted = actionSessionState.completedActionIds.has(actionId)
    if (isCompleted) {
      await unmarkActionAsCompleted(actionId)
    } else {
      const action = actionSessionState.actions.find(a => a.id === actionId)
      if (action) {
        let timeSpent = action.estimatedMinutes || 0
        
        // If this is the current active action and timer is running, use actual elapsed time
        if (action.id === currentAction?.id && timerState.isActive && actionStartTimeRef.current) {
          const adjustedElapsed = calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current)
          timeSpent = Math.ceil(adjustedElapsed / 60)
        }
        
        await markActionAsCompleted(actionId, timeSpent)
      }
    }
  }, [actionSessionState.completedActionIds, actionSessionState.actions, currentAction, timerState.isActive, markActionAsCompleted, unmarkActionAsCompleted]);

  // Handle mark complete button click
  const handleMarkCompleteClick = useCallback(() => {
    if (currentAction && timerState.isActive) {
      setShowMarkCompleteModal(true)
    }
  }, [currentAction, timerState.isActive])

  // Handle mark complete confirmation
  const handleMarkCompleteConfirm = useCallback(async () => {
    if (currentAction && actionStartTimeRef.current) {
      // Calculate actual time spent on this action
      const actionTimeSpent = Math.ceil(
        calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
      )
      
      // Stop the timer
      soundManager.stopTicking()
      
      // Mark action as completed
      await markActionAsCompleted(currentAction.id, actionTimeSpent)
      
      // Update session time
      if (sessionStartTime) {
        const totalSessionTime = Math.ceil(
          calculateAdjustedElapsed(sessionStartTime, pausedTimeRef.current) / 60
        )
        await updateTimeSpent(totalSessionTime)
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

      setShowMarkCompleteModal(false)
      
      // Move to next action or complete session
      handleNextAction()
    }
  }, [currentAction, markActionAsCompleted, updateTimeSpent, sessionStartTime, handleNextAction])

  // Handle time extension
  const handleExtendTime = useCallback(async (extensionMinutes: number) => {
    if (!timerState.isActive || !currentAction) return

    const extensionSeconds = extensionMinutes * 60
    
    // Simply add the extension to the current duration
    // The remaining time will be recalculated in the timer effect
    setTimerState(prev => ({
      ...prev,
      duration: prev.duration + extensionSeconds
    }))

    // Track the extension locally
    setCurrentActionExtensions(prev => [...prev, extensionMinutes])

    // IMPORTANT: Save the extension to the correct action in the session context
    addTimeExtension(currentAction.id, extensionMinutes)

    // Resume timer if it was paused
    if (timerState.isPaused) {
      resumeTimer()
    } else {
      // Restart ticking sound if needed
      soundManager.startTicking()
    }
  }, [timerState.isActive, timerState.isPaused, resumeTimer, currentAction, addTimeExtension])



  // Handle timer completion
  useEffect(() => {
    if (!timerState.isActive || timerState.isPaused) return

    const checkCompletion = async () => {
      const adjustedElapsed = calculateAdjustedElapsed(timerState.startTime, pausedTimeRef.current)
      const remaining = Math.max(0, timerState.duration - adjustedElapsed)

      if (remaining === 0) {
        // Stop ticking sound
        soundManager.stopTicking()
        
        // Pause the timer and show extension options
        setTimerState(prev => ({ ...prev, isPaused: true }))
        setShowExtensionModal(true)
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
      } else if (event.code === 'Enter' && timerState.isActive && currentAction) {
        event.preventDefault()
        handleMarkCompleteClick()
      } else if (event.code === 'Escape' && timerState.isActive) {
        event.preventDefault()
        stopTimer()
      } else if (event.code === 'ArrowLeft' && currentActionIndex > 0) {
        event.preventDefault()
        handleNavigationClick('previous')
      } else if (event.code === 'ArrowRight' && currentActionIndex < actionSessionState.actions.length - 1) {
        event.preventDefault()
        handleNavigationClick('next')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [timerState.isActive, timerState.isPaused, pauseTimer, resumeTimer, stopTimer, currentAction, handleMarkCompleteClick, currentActionIndex, actionSessionState.actions.length, handleNavigationClick])

  // Get current action details
  const getCurrentActionDetails = () => {
    if (!currentAction) return null
    
    const isCompleted = actionSessionState.completedActionIds.has(currentAction.id)
    return {
      ...currentAction,
      isCompleted
    }
  }

  // Handle completing action and moving to next
  const handleCompleteAndContinue = useCallback(async () => {
    if (currentAction && actionStartTimeRef.current) {
      // Calculate actual time spent including extensions
      const actionTimeSpent = Math.ceil(
        calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
      )
      
      // Mark action as completed with extensions tracked
      await markActionAsCompleted(currentAction.id, actionTimeSpent)
      
      // Note: Extensions are already saved to the action via handleExtendTime -> addTimeExtension
    }

    setShowExtensionModal(false)
    setCurrentActionExtensions([])
    handleNextAction()
  }, [currentAction, markActionAsCompleted, handleNextAction])


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
              {actionSessionState.actions.map((action, index) => {
                const isCompleted = actionSessionState.completedActionIds.has(action.id) || action.status === 'completed';
                return (
                  <li key={action.id} className={`flex items-center p-2 rounded-lg ${currentActionIndex === index ? 'bg-blue-100' : ''}`}>
                    <Checkbox
                      id={`action-${action.id}`}
                      checked={isCompleted}
                      onCheckedChange={(checked) => {
                        if (checked !== isCompleted) {
                          handleToggleActionCompletion(action.id)
                        }
                      }}
                      className="mr-3"
                    />
                    <label htmlFor={`action-${action.id}`} className={`flex-grow text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {action.text} ({action.estimatedMinutes}m)
                      {isCompleted && action.actualMinutes && (
                        <span className="text-green-600 ml-2">
                          (✓ {action.actualMinutes}m)
                        </span>
                      )}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Session Progress Indicator */}
          {actionSessionState.sessionId && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-blue-800 font-semibold text-sm">Session Progress</h3>
                <span className="text-blue-600 text-sm">
                  {(() => {
                    const totalActions = actionSessionState.actions.length;
                    // Always calculate by checking both status and completedActionIds for reliability
                    const completedCount = actionSessionState.actions.filter(action =>
                      action.status === 'completed' || actionSessionState.completedActionIds.has(action.id)
                    ).length;
                    
                    return `${completedCount} / ${totalActions} actions completed`;
                  })()}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${actionSessionState.actions.length > 0 
                      ? (() => {
                          // Use the same calculation as the counter above
                          const completedCount = actionSessionState.actions.filter(action =>
                            action.status === 'completed' || actionSessionState.completedActionIds.has(action.id)
                          ).length;
                          return (completedCount / actionSessionState.actions.length) * 100;
                        })()
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
              onMarkComplete={handleMarkCompleteClick}
              onPrevious={() => handleNavigationClick('previous')}
              onNext={() => handleNavigationClick('next')}
              showMarkComplete={!!currentAction}
              showNavigation={true}
              canGoPrevious={currentActionIndex > 0}
              canGoNext={currentActionIndex < actionSessionState.actions.length - 1}
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
       {/* Timer Extension Modal */}
       <TimerExtensionModal
         isOpen={showExtensionModal}
         onClose={() => setShowExtensionModal(false)}
         onExtend={handleExtendTime}
         onComplete={handleCompleteAndContinue}
         actionText={currentAction?.text}
         currentExtensions={currentActionExtensions}
       />

       {/* Simple completion dialog for when user chooses to finish without extension */}
       <AlertDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Action?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you ready to mark this action as complete and move to the next one?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCompletionDialog(false)}>Continue Working</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteAndContinue}>Complete & Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark Complete Modal */}
      {currentAction && (
        <ActionCompletionModal
          isOpen={showMarkCompleteModal}
          onClose={() => setShowMarkCompleteModal(false)}
          onConfirm={handleMarkCompleteConfirm}
          actionText={currentAction.text}
          estimatedMinutes={currentAction.estimatedMinutes || 0}
          actualMinutes={actionStartTimeRef.current ? Math.ceil(
            calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
          ) : 0}
          nextActionText={
            currentActionIndex + 1 < actionSessionState.actions.length 
              ? actionSessionState.actions[currentActionIndex + 1].text 
              : undefined
          }
        />
      )}

      {/* Action Navigation Modal */}
      {currentAction && (
        <ActionNavigationModal
          isOpen={showNavigationModal}
          onClose={() => setShowNavigationModal(false)}
          onConfirm={handleConfirmedNavigation}
          direction={navigationDirection}
          currentActionText={currentAction.text}
          targetActionText={
            navigationDirection === 'next' && currentActionIndex + 1 < actionSessionState.actions.length
              ? actionSessionState.actions[currentActionIndex + 1].text
              : navigationDirection === 'previous' && currentActionIndex > 0
              ? actionSessionState.actions[currentActionIndex - 1].text
              : ''
          }
          currentProgress={
            actionStartTimeRef.current ? {
              timeSpent: Math.ceil(
                calculateAdjustedElapsed(actionStartTimeRef.current, pausedTimeRef.current) / 60
              ),
              estimatedTime: currentAction.estimatedMinutes || 0
            } : undefined
          }
        />
      )}
    </div>
  )
}