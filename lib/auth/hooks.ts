'use client'

import { useAuth } from './context'
import { supabase } from '../supabase/client'

/**
 * Hook for handling database operations that require authentication
 * Provides graceful degradation when user is not authenticated
 */
export function useAuthenticatedOperations() {
  const { user, session } = useAuth()

  const isAuthenticated = !!user && !!session

  /**
   * Execute a database operation only if authenticated
   * Returns null if not authenticated, allowing app to continue with local state
   */
  const executeIfAuthenticated = async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    if (!isAuthenticated) {
      return null
    }

    try {
      return await operation()
    } catch (error) {
      console.error('Authenticated operation failed:', error)
      return null
    }
  }

  /**
   * Save task to database if authenticated
   */
  const saveTask = async (goal: string, dueDate?: string, urgency?: 'low' | 'medium' | 'high') => {
    return executeIfAuthenticated(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user!.id,
          goal,
          due_date: dueDate,
          urgency: urgency || 'medium'
        })
        .select()
        .single()

      if (error) throw error
      return data
    })
  }

  /**
   * Save AI suggestion to database if authenticated
   */
  const saveSuggestion = async (
    taskId: string,
    firstStep: { description: string; estimatedSeconds: number },
    nextActions: string[],
    bufferRecommendation?: number,
    fallbackUsed?: boolean
  ) => {
    return executeIfAuthenticated(async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          task_id: taskId,
          user_id: user!.id,
          first_step: firstStep,
          next_actions: nextActions,
          buffer_recommendation: bufferRecommendation,
          fallback_used: fallbackUsed || false
        })
        .select()
        .single()

      if (error) throw error
      return data
    })
  }

  /**
   * Save timer session to database if authenticated
   */
  const saveSession = async (
    taskId: string,
    goal: string,
    plannedDuration: number,
    actualDuration: number,
    completed: boolean,
    startedAt: Date,
    completedAt?: Date
  ) => {
    return executeIfAuthenticated(async () => {
      const variance = ((actualDuration - plannedDuration) / plannedDuration) * 100

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user!.id,
          task_id: taskId,
          goal,
          planned_duration: plannedDuration,
          actual_duration: actualDuration,
          completed,
          variance,
          started_at: startedAt.toISOString(),
          completed_at: completedAt?.toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    })
  }

  /**
   * Get user's recent tasks if authenticated
   */
  const getRecentTasks = async (limit = 10) => {
    return executeIfAuthenticated(async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    })
  }

  /**
   * Get user's session history if authenticated
   */
  const getSessionHistory = async (limit = 20) => {
    return executeIfAuthenticated(async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    })
  }

  return {
    isAuthenticated,
    user,
    saveTask,
    saveSuggestion,
    saveSession,
    getRecentTasks,
    getSessionHistory,
  }
}