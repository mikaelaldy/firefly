import { supabase } from './client'
import type { TimerSession, Session } from '@/types'

/**
 * Client-side session management functions
 * These functions use the client-side Supabase instance
 */

/**
 * Saves a completed timer session to the database from the client side.
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
 * Fetches recent sessions for the current user from the client side.
 * @param limit - The number of recent sessions to fetch
 * @returns An array of recent sessions
 */
export async function getRecentSessions(limit: number = 10): Promise<Session[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user found, returning empty array for recent sessions.')
      return []
    }

    const { data, error } = await supabase
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
  } catch (error) {
    console.error('Error in getRecentSessions:', error)
    return []
  }
}
