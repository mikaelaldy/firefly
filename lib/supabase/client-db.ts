import { supabase } from './client'
import type { Task, Suggestion, Session, Profile } from '@/types'

/**
 * Client-side database utility functions for Supabase operations
 * These functions handle the database operations from the browser with proper typing and error handling
 */

export class ClientDatabaseService {
  // Task operations
  async createTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert(task)
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return null
    }

    return data
  }

  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return data || []
  }

  async getTask(taskId: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (error) {
      console.error('Error fetching task:', error)
      return null
    }

    return data
  }

  // Suggestion operations
  async createSuggestion(suggestion: Omit<Suggestion, 'id' | 'created_at'>): Promise<Suggestion | null> {
    const { data, error } = await supabase
      .from('suggestions')
      .insert(suggestion)
      .select()
      .single()

    if (error) {
      console.error('Error creating suggestion:', error)
      return null
    }

    return data
  }

  async getSuggestionsByTask(taskId: string): Promise<Suggestion[]> {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching suggestions:', error)
      return []
    }

    return data || []
  }

  // Session operations
  async createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return null
    }

    return data
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating session:', error)
      return null
    }

    return data
  }

  async getSessions(userId: string): Promise<Session[]> {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      return []
    }

    return data || []
  }
}

// Export a singleton instance
export const clientDb = new ClientDatabaseService()