'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { EditableAction } from '@/types'
import { 
  createActionSession, 
  markActionCompleted, 
  unmarkActionCompleted,
  updateSessionProgress,
  getActionSession,
  type ActionSessionData,
  type EditableActionData
} from '@/lib/supabase/action-sessions'

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
}

interface ActionSessionContextType {
  state: ActionSessionState
  startActionSession: (goal: string, actions: EditableAction[]) => Promise<string | null>
  markActionAsCompleted: (actionId: string, actualMinutesSpent: number) => Promise<void>
  unmarkActionAsCompleted: (actionId: string) => Promise<void>
  setCurrentAction: (actionId: string | null) => void
  updateTimeSpent: (minutes: number) => Promise<void>
  completeSession: () => Promise<void>
  resetSession: () => void
  loadSession: (sessionId: string) => Promise<void>
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
  error: null
}

export function ActionSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ActionSessionState>(initialState)

  /**
   * Start a new action session
   */
  const startActionSession = useCallback(async (goal: string, actions: EditableAction[]): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { sessionId, error } = await createActionSession(goal, actions)
      
      if (error) {
        setState(prev => ({ ...prev, error, isLoading: false }))
        return null
      }

      const totalEstimatedTime = actions.reduce((sum, action) => sum + (action.estimatedMinutes || 0), 0)

      setState(prev => ({
        ...prev,
        sessionId,
        goal,
        actions,
        completedActionIds: new Set(),
        currentActionId: null,
        totalEstimatedTime,
        actualTimeSpent: 0,
        status: 'active',
        isLoading: false,
        error: null
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

      setState(prev => ({
        ...prev,
        completedActionIds: new Set([...prev.completedActionIds, actionId]),
        isLoading: false,
        error: null
      }))

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
      // This will be a new function in the supabase client
      const { success, error } = await unmarkActionCompleted(actionId) 
      
      if (error) {
        setState(prev => ({ ...prev, error, isLoading: false }))
        return
      }

      setState(prev => {
        const newCompletedActionIds = new Set(prev.completedActionIds)
        newCompletedActionIds.delete(actionId)
        return {
          ...prev,
          completedActionIds: newCompletedActionIds,
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
   * Set the current action being worked on
   */
  const setCurrentAction = useCallback((actionId: string | null) => {
    setState(prev => ({ ...prev, currentActionId: actionId }))
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
        originalText: action.original_text
      }))

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

  const contextValue: ActionSessionContextType = {
    state,
    startActionSession,
    markActionAsCompleted,
    unmarkActionAsCompleted,
    setCurrentAction,
    updateTimeSpent,
    completeSession,
    resetSession,
    loadSession
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