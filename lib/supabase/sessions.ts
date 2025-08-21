import { createServerClient } from './server'
import { supabase } from './client'
import type { TimerSession, Session } from '@/types'
import { calculateVariance } from '../timer-utils'

/**
 * Saves a completed timer session to the database.
 * This function is designed to be called from the client-side.
 * @param session - The session data to save
 * @returns The saved session from the database, or null if failed
 */
export async function saveSession(session: TimerSession, taskId?: string): Promise<Session | null> {
  try {
    // Use the client-side Supabase instance, which has the user's session
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.warn('Cannot save session, no user is authenticated on the client.')
      // Store in localStorage as a fallback if needed, or just return
      return null
    }

    // Prepare data for insertion
    const sessionData = {
      id: session.id,
      user_id: user.id,
      task_id: taskId,
      goal: session.goal,
      planned_duration: session.plannedDuration,
      actual_duration: session.actualDuration,
      completed: session.completed,
      variance: session.variance,
      started_at: session.startedAt.toISOString(),
      completed_at: session.completedAt ? session.completedAt.toISOString() : undefined,
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Error saving session to Supabase:', error)
      // Attempt to save to localStorage as a fallback?
      return null
    }

    console.log('Session saved successfully:', data)
    return data
  } catch (error) {
    console.error('An unexpected error occurred in saveSession:', error)
    return null
  }
}

/**
 * Fetches recent sessions for the current user.
 * This should be used from a server component or API route.
 * @param limit - The number of recent sessions to fetch
 * @returns An array of recent sessions
 */
export async function getRecentSessions(limit: number = 10): Promise<Session[]> {
  const serverSupabase = createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    console.log('No user found, returning empty array for recent sessions.')
    return []
  }

  const { data, error } = await serverSupabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent sessions:', error)
    return []
  }

  return data || []
}

/**
 * Calculates and returns key statistics for the user's sessions.
 * This should be used from a server component or API route.
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  completedSessions: number;
  averageVariance: number;
  totalFocusTime: number; // in minutes
}> {
  const serverSupabase = createServerClient()
  const { data: { user } } = await serverSupabase.auth.getUser()

  if (!user) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageVariance: 0,
      totalFocusTime: 0,
    }
  }

  const { data, error } = await serverSupabase
    .from('sessions')
    .select('completed, variance, actual_duration')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching session stats:', error)
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageVariance: 0,
      totalFocusTime: 0,
    }
  }

  if (!data || data.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageVariance: 0,
      totalFocusTime: 0,
    }
  }

  const totalSessions = data.length
  const completedSessions = data.filter(s => s.completed).length
  const totalVariance = data.reduce((acc, s) => acc + (s.variance || 0), 0)
  const totalFocusTime = data.reduce((acc, s) => acc + (s.actual_duration || 0), 0) / 60

  return {
    totalSessions,
    completedSessions,
    averageVariance: totalSessions > 0 ? totalVariance / totalSessions : 0,
    totalFocusTime,
  }
}