import { supabase } from '@/lib/supabase/client'
import type { TimerSession, Session } from '@/types'

/**
 * Save a completed timer session to the database
 */
export async function saveSession(session: TimerSession, taskId?: string): Promise<Session | null> {
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.warn('No authenticated user - session not saved to database')
      return null
    }

    // Convert TimerSession to database Session format
    const sessionData = {
      user_id: user.id,
      task_id: taskId || null,
      goal: session.goal,
      planned_duration: session.plannedDuration,
      actual_duration: session.actualDuration,
      completed: session.completed,
      variance: session.variance,
      started_at: session.startedAt.toISOString(),
      completed_at: session.completedAt?.toISOString() || null
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('Error saving session:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error saving session:', error)
    return null
  }
}

/**
 * Get recent sessions for the current user
 */
export async function getRecentSessions(limit: number = 10): Promise<Session[]> {
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching sessions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error fetching sessions:', error)
    return []
  }
}

/**
 * Get session statistics for the current user
 */
export async function getSessionStats(): Promise<{
  totalSessions: number;
  completedSessions: number;
  averageVariance: number;
  totalFocusTime: number; // in minutes
}> {
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        averageVariance: 0,
        totalFocusTime: 0
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('completed, variance, actual_duration')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching session stats:', error)
      return {
        totalSessions: 0,
        completedSessions: 0,
        averageVariance: 0,
        totalFocusTime: 0
      }
    }

    const sessions = data || []
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.completed).length
    
    // Calculate average variance (only for sessions with variance data)
    const sessionsWithVariance = sessions.filter(s => s.variance !== null)
    const averageVariance = sessionsWithVariance.length > 0
      ? sessionsWithVariance.reduce((sum, s) => sum + (s.variance || 0), 0) / sessionsWithVariance.length
      : 0

    // Calculate total focus time in minutes
    const totalFocusTime = Math.round(
      sessions.reduce((sum, s) => sum + (s.actual_duration || 0), 0) / 60
    )

    return {
      totalSessions,
      completedSessions,
      averageVariance: Math.round(averageVariance * 100) / 100,
      totalFocusTime
    }
  } catch (error) {
    console.error('Unexpected error fetching session stats:', error)
    return {
      totalSessions: 0,
      completedSessions: 0,
      averageVariance: 0,
      totalFocusTime: 0
    }
  }
}