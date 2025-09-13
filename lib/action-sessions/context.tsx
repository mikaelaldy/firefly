'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { EditableAction, SessionCompletionStats } from '@/types'
import { 
  createActionSession, 
  markActionCompleted, 
  unmarkActionCompleted,
  updateSessionProgress,
  getActionSession,
  type ActionSessionData,
  type EditableActionData
} from '@/lib/supabase/action-sessions'
import {
  updateActionStatus,
  completeAction,
  skipAction,
  reactivateAction,
  activateAction,
  calculateSessionStats,
  isSessionComplete,
  getNextPendingAction,
  getCurrentActiveAction,
  generateSessionSummary,
  addTimeExtension
} from './action-status'

interface ActionSessionState {
  sessionId: string | null
  goal: string
  actions: EditableAction[]
  completedActionIds: Set<string>
  currentActionId: string | null
  totalEstimatedTime: number
  actualTimeSpent: number
  status: 'active' | 'completed' | 'paused'
  isLoading: boolean
  error: string | null
  completionStats: SessionCompletionStats | null
  isSessionComplete: boolean
}

interface ActionSessionContextType {
  state: ActionSessionState
  startActionSession: (goal: string, actions: EditableAction[]) => Promise<string | null>
  markActionAsCompleted: (actionId: string, actualMinutesSpent: number) => Promise<void>
  unmarkActionAsCompleted: (actionId: string) => Promise<void>
  skipAction: (actionId: string) => Promise<void>
  reactivateAction: (actionId: string) => Promise<void>
  setCurrentAction: (actionId: string | null) => void
  updateTimeSpent: (minutes: number) => Promise<void>
  addTimeExtension: (actionId: string, extensionMinutes: number) => void
  completeSession: () => Promise<void>
  resetSession: () => void
  loadSession: (sessionId: string) => Promise<void>
  getSessionSummary: () => { title: string; message: string; type: 'success' | 'partial' | 'incomplete' } | null
}

const ActionSessionContext = createContext<ActionSessionContextType | undefined>(undefined)

const initialState: ActionSessionState = {
  sessionId: null,
  goal: '',
  actions: [],
  completedActionIds: new Set(),
  currentActionId: null,
  totalEstimatedTime: 0,
  actualTimeSpent: 0,
  status: 'active',
  isLoading: false,
  error: null,
  completionStats: null,
  isSessionComplete: false
}

export function ActionSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ActionSessionState>(initialState)

  /**
   * Start a new action session
   */
  const startActionSession = useCallback(async (goal: string, actions: EditableAction[]): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Initialize actions with proper status
      const initializedActions = actions.map(action => ({
        ...action,
        status: action.status || 'pending' as const
      }))

      const { sessionId, error } = await createActionSession(goal, initializedActions)
      
      if (error) {
        setState(prev => ({ ...prev, error, isLoading: false }))
        return null
      }

      const totalEstimatedTime = initializedActions.reduce((sum, action) => sum + (action.estimatedMinutes || 0), 0)
      const completionStats = calculateSessionStats(initializedActions)

      setState(prev => ({
        ...prev,
        sessionId,
        goal,
        actions: initializedActions,
        completedActionIds: new Set(),
        currentActionId: null,
        totalEstimatedTime,
        actualTimeSpent: 0,
        status: 'active',
        isLoading: false,
        error: null,
        completionStats,
        isSessionComplete: false
      }))

      return sessionId
    } catch (error) {
      console.error('Error starting action session:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to start action session', 
        isLoading: false 
      }))
      return null
    }
  }, [])

  /**
   * Mark an action as completed
   */
  const markActionAsCompleted = useCallback(async (actionId: string, actualMinutesSpent: number) => {
    if (!state.sessionId) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const { success, error } = await markActionCompleted(actionId, actualMinutesSpent)
      
      if (error) {
        setState(prev => ({ ...prev, error, isLoading: false }))
        return
      }

      setState(prev => {
        const updatedActions = prev.actions.map(action => {
          if (action.id === actionId) {
            return completeAction(action, actualMinutesSpent)
          }
          return action
        })

        const completionStats = calculateSessionStats(updatedActions)
        const sessionComplete = isSessionComplete(updatedActions)

        return {
          ...prev,
          actions: updatedActions,
          completedActionIds: new Set([...prev.completedActionIds, actionId]),
          completionStats,
          isSessionComplete: sessionComplete,
          isLoading: false,
          error: null
        }
      })

    } catch (error) {
      console.error('Error marking action as completed:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to mark action as completed', 
        isLoading: false 
      }))
    }
  }, [state.sessionId])

  /**
   * Unmark an action as completed
   */
  const unmarkActionAsCompleted = useCallback(async (actionId: string) => {
    if (!state.sessionId) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const { success, error } = await unmarkActionCompleted(actionId) 
      
      if (error) {
        setState(prev => ({ ...prev, error, isLoading: false }))
        return
      }

      setState(prev => {
        const updatedActions = prev.actions.map(action => {
          if (action.id === actionId) {
            return reactivateAction(action)
          }
          return action
        })

        const newCompletedActionIds = new Set(prev.completedActionIds)
        newCompletedActionIds.delete(actionId)
        
        const completionStats = calculateSessionStats(updatedActions)
        const sessionComplete = isSessionComplete(updatedActions)

        return {
          ...prev,
          actions: updatedActions,
          completedActionIds: newCompletedActionIds,
          completionStats,
          isSessionComplete: sessionComplete,
          isLoading: false,
          error: null
        }
      })

    } catch (error) {
      console.error('Error unmarking action as completed:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to unmark action as completed', 
        isLoading: false 
      }))
    }
  }, [state.sessionId])

  /**
   * Skip an action
   */
  const skipActionHandler = useCallback(async (actionId: string) => {
    if (!state.sessionId) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      // For now, we'll handle skipping locally and sync later
      // In a full implementation, this would call a supabase function
      
      setState(prev => {
        const updatedActions = prev.actions.map(action => {
          if (action.id === actionId) {
            return skipAction(action)
          }
          return action
        })

        const completionStats = calculateSessionStats(updatedActions)
        const sessionComplete = isSessionComplete(updatedActions)

        return {
          ...prev,
          actions: updatedActions,
          completionStats,
          isSessionComplete: sessionComplete,
          isLoading: false,
          error: null
        }
      })

    } catch (error) {
      console.error('Error skipping action:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to skip action', 
        isLoading: false 
      }))
    }
  }, [state.sessionId])

  /**
   * Reactivate a completed or skipped action
   */
  const reactivateActionHandler = useCallback(async (actionId: string) => {
    if (!state.sessionId) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      setState(prev => {
        const updatedActions = prev.actions.map(action => {
          if (action.id === actionId) {
            return reactivateAction(action)
          }
          return action
        })

        // Remove from completed set if it was completed
        const newCompletedActionIds = new Set(prev.completedActionIds)
        newCompletedActionIds.delete(actionId)

        const completionStats = calculateSessionStats(updatedActions)
        const sessionComplete = isSessionComplete(updatedActions)

        return {
          ...prev,
          actions: updatedActions,
          completedActionIds: newCompletedActionIds,
          completionStats,
          isSessionComplete: sessionComplete,
          isLoading: false,
          error: null
        }
      })

    } catch (error) {
      console.error('Error reactivating action:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to reactivate action', 
        isLoading: false 
      }))
    }
  }, [state.sessionId])

  /**
   * Set the current action being worked on
   */
  const setCurrentAction = useCallback((actionId: string | null) => {
    setState(prev => {
      const updatedActions = prev.actions.map(action => {
        if (action.id === actionId && action.status === 'pending') {
          return activateAction(action)
        } else if (action.id !== actionId && action.status === 'active') {
          // Deactivate other actions
          return updateActionStatus(action, 'pending')
        }
        return action
      })

      return {
        ...prev,
        currentActionId: actionId,
        actions: updatedActions
      }
    })
  }, [])

  /**
   * Add time extension to an action
   */
  const addTimeExtensionHandler = useCallback((actionId: string, extensionMinutes: number) => {
    setState(prev => {
      const updatedActions = prev.actions.map(action => {
        if (action.id === actionId) {
          return addTimeExtension(action, extensionMinutes)
        }
        return action
      })

      return {
        ...prev,
        actions: updatedActions
      }
    })
  }, [])

  /**
   * Update total time spent on the session
   */
  const updateTimeSpent = useCallback(async (minutes: number) => {
    if (!state.sessionId) return

    try {
      const { success, error } = await updateSessionProgress(state.sessionId, minutes)
      
      if (error) {
        setState(prev => ({ ...prev, error }))
        return
      }

      setState(prev => ({ ...prev, actualTimeSpent: minutes }))
    } catch (error) {
      console.error('Error updating time spent:', error)
      setState(prev => ({ ...prev, error: 'Failed to update time spent' }))
    }
  }, [state.sessionId])

  /**
   * Complete the entire session
   */
  const completeSession = useCallback(async () => {
    if (!state.sessionId) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const { success, error } = await updateSessionProgress(
        state.sessionId, 
        state.actualTimeSpent, 
        'completed'
      )
      
      if (error) {
        setState(prev => ({ ...prev, error, isLoading: false }))
        return
      }

      setState(prev => ({
        ...prev,
        status: 'completed',
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('Error completing session:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to complete session', 
        isLoading: false 
      }))
    }
  }, [state.sessionId, state.actualTimeSpent])

  /**
   * Reset session state
   */
  const resetSession = useCallback(() => {
    setState(initialState)
  }, [])

  /**
   * Load an existing session
   */
  const loadSession = useCallback(async (sessionId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { session, actions, error } = await getActionSession(sessionId)
      
      if (error || !session) {
        setState(prev => ({ ...prev, error: error || 'Session not found', isLoading: false }))
        return
      }

      // Convert database actions to EditableAction format
      const editableActions: EditableAction[] = actions.map(action => ({
        id: action.id!,
        text: action.text,
        estimatedMinutes: action.estimated_minutes,
        confidence: action.confidence,
        isCustom: action.is_custom || false,
        originalText: action.original_text,
        status: action.completed_at ? 'completed' : 'pending',
        completedAt: action.completed_at ? new Date(action.completed_at) : undefined
      }));

      // Find completed actions
      const completedIds = new Set(
        actions.filter(action => action.completed_at).map(action => action.id!)
      )

      setState(prev => ({
        ...prev,
        sessionId: session.id!,
        goal: session.goal,
        actions: editableActions,
        completedActionIds: completedIds,
        totalEstimatedTime: session.total_estimated_time || 0,
        actualTimeSpent: session.actual_time_spent || 0,
        status: session.status as 'active' | 'completed' | 'paused' || 'active',
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('Error loading session:', error)
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load session', 
        isLoading: false 
      }))
    }
  }, [])

  /**
   * Get a summary of the session
   */
  const getSessionSummary = useCallback(() => {
    if (!state.sessionId) return null
    const stats = calculateSessionStats(state.actions)
    return generateSessionSummary(stats)
  }, [state.sessionId, state.actions])

  const contextValue: ActionSessionContextType = {
    state,
    startActionSession,
    markActionAsCompleted,
    unmarkActionAsCompleted,
    skipAction: skipActionHandler,
    reactivateAction: reactivateActionHandler,
    setCurrentAction,
    updateTimeSpent,
    addTimeExtension: addTimeExtensionHandler,
    completeSession,
    resetSession,
    loadSession,
    getSessionSummary
  }

  return (
    <ActionSessionContext.Provider value={contextValue}>
      {children}
    </ActionSessionContext.Provider>
  )
}

export function useActionSession() {
  const context = useContext(ActionSessionContext)
  if (context === undefined) {
    throw new Error('useActionSession must be used within an ActionSessionProvider')
  }
  return context
}