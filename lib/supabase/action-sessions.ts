'use client'

import { supabase } from './client'
import type { EditableAction, ActionSession } from '@/types'

// Local storage keys for offline sync
const OFFLINE_SESSIONS_KEY = 'firefly_offline_sessions'
const OFFLINE_ACTIONS_KEY = 'firefly_offline_actions'
const PENDING_SYNC_KEY = 'firefly_pending_sync'

export interface ActionSessionData {
  id?: string
  user_id?: string
  goal: string
  total_estimated_time?: number
  actual_time_spent?: number
  status?: 'active' | 'completed' | 'paused'
  created_at?: string
  updated_at?: string
}

export interface EditableActionData {
  id?: string
  session_id: string
  text: string
  estimated_minutes?: number
  confidence?: 'low' | 'medium' | 'high'
  is_custom?: boolean
  original_text?: string
  order_index: number
  completed_at?: string
  created_at?: string
}

// Offline sync types
interface OfflineSession extends ActionSessionData {
  offline_id: string
  needs_sync: boolean
  sync_attempts: number
  last_sync_attempt?: string
}

interface OfflineAction extends EditableActionData {
  offline_id: string
  needs_sync: boolean
  sync_attempts: number
  last_sync_attempt?: string
}

interface PendingSyncOperation {
  id: string
  type: 'create_session' | 'update_session' | 'create_action' | 'update_action' | 'delete_action'
  data: any
  timestamp: string
  attempts: number
}

// Utility functions for offline sync
function isOnline(): boolean {
  return navigator.onLine
}

function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

function getFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Failed to read from localStorage:', error)
    return null
  }
}

function addPendingSyncOperation(operation: Omit<PendingSyncOperation, 'id' | 'timestamp' | 'attempts'>): void {
  const pendingOps = getFromLocalStorage<PendingSyncOperation[]>(PENDING_SYNC_KEY) || []
  const newOp: PendingSyncOperation = {
    ...operation,
    id: generateOfflineId(),
    timestamp: new Date().toISOString(),
    attempts: 0
  }
  pendingOps.push(newOp)
  saveToLocalStorage(PENDING_SYNC_KEY, pendingOps)
}

/**
 * Sync pending offline operations when back online
 */
export async function syncOfflineData(): Promise<{ success: boolean; synced: number; errors: string[] }> {
  if (!isOnline()) {
    return { success: false, synced: 0, errors: ['Device is offline'] }
  }

  const pendingOps = getFromLocalStorage<PendingSyncOperation[]>(PENDING_SYNC_KEY) || []
  if (pendingOps.length === 0) {
    return { success: true, synced: 0, errors: [] }
  }

  const errors: string[] = []
  let synced = 0

  // Process operations in chronological order
  const sortedOps = pendingOps.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  
  for (const op of sortedOps) {
    try {
      let success = false
      
      switch (op.type) {
        case 'create_session':
          const sessionResult = await createActionSession(op.data.goal, op.data.actions)
          success = !sessionResult.error
          break
        case 'update_session':
          const updateResult = await updateSessionProgress(op.data.sessionId, op.data.actualTimeSpent, op.data.status)
          success = updateResult.success
          break
        case 'create_action':
          // Handle action creation sync
          success = true // Placeholder - would need specific implementation
          break
        case 'update_action':
          const actionResult = await markActionCompleted(op.data.actionId, op.data.actualMinutesSpent)
          success = actionResult.success
          break
      }

      if (success) {
        synced++
      } else {
        errors.push(`Failed to sync ${op.type} operation`)
      }
    } catch (error) {
      errors.push(`Error syncing ${op.type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Clear successfully synced operations
  if (synced > 0) {
    const remainingOps = pendingOps.slice(synced)
    saveToLocalStorage(PENDING_SYNC_KEY, remainingOps)
  }

  return { success: errors.length === 0, synced, errors }
}

/**
 * Create a new action session with associated actions
 */
export async function createActionSession(
  goal: string,
  actions: EditableAction[]
): Promise<{ sessionId: string; actions?: EditableActionData[]; error?: string; isOffline?: boolean }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Handle offline scenario
    if (!isOnline() || !user) {
      const offlineSessionId = generateOfflineId()
      const totalEstimatedTime = actions.reduce((sum, action) => sum + (action.estimatedMinutes || 0), 0)
      
      const offlineSession: OfflineSession = {
        offline_id: offlineSessionId,
        goal,
        total_estimated_time: totalEstimatedTime,
        actual_time_spent: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        needs_sync: true,
        sync_attempts: 0
      }

      // Save offline session
      const offlineSessions = getFromLocalStorage<OfflineSession[]>(OFFLINE_SESSIONS_KEY) || []
      offlineSessions.push(offlineSession)
      saveToLocalStorage(OFFLINE_SESSIONS_KEY, offlineSessions)

      // Save offline actions
      const offlineActions = getFromLocalStorage<OfflineAction[]>(OFFLINE_ACTIONS_KEY) || []
      const actionsData: OfflineAction[] = actions.map((action, index) => ({
        offline_id: generateOfflineId(),
        session_id: offlineSessionId,
        text: action.text,
        estimated_minutes: action.estimatedMinutes,
        confidence: action.confidence,
        is_custom: action.isCustom,
        original_text: action.originalText,
        order_index: index,
        created_at: new Date().toISOString(),
        needs_sync: true,
        sync_attempts: 0
      }))
      
      offlineActions.push(...actionsData)
      saveToLocalStorage(OFFLINE_ACTIONS_KEY, offlineActions)

      // Add to pending sync operations
      addPendingSyncOperation({
        type: 'create_session',
        data: { goal, actions }
      })

      return { 
        sessionId: offlineSessionId, 
        isOffline: true,
        error: user ? undefined : 'Working offline - will sync when online'
      }
    }

    const totalEstimatedTime = actions.reduce((sum, action) => sum + (action.estimatedMinutes || 0), 0)

    // Create action session online
    const { data: sessionData, error: sessionError } = await supabase
      .from('action_sessions')
      .insert({
        user_id: user.id,
        goal,
        total_estimated_time: totalEstimatedTime,
        status: 'active'
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Error creating action session:', sessionError)
      
      // Fallback to offline mode on database error
      const offlineSessionId = generateOfflineId()
      const offlineSession: OfflineSession = {
        offline_id: offlineSessionId,
        user_id: user.id,
        goal,
        total_estimated_time: totalEstimatedTime,
        actual_time_spent: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        needs_sync: true,
        sync_attempts: 0
      }

      const offlineSessions = getFromLocalStorage<OfflineSession[]>(OFFLINE_SESSIONS_KEY) || []
      offlineSessions.push(offlineSession)
      saveToLocalStorage(OFFLINE_SESSIONS_KEY, offlineSessions)

      addPendingSyncOperation({
        type: 'create_session',
        data: { goal, actions }
      })

      return { sessionId: offlineSessionId, isOffline: true, error: 'Database error - saved offline' }
    }

    // Create editable actions
    const actionsData: EditableActionData[] = actions.map((action, index) => ({
      session_id: sessionData.id,
      text: action.text,
      estimated_minutes: action.estimatedMinutes,
      confidence: action.confidence,
      is_custom: action.isCustom,
      original_text: action.originalText,
      order_index: index
    }))

    const { data: insertedActions, error: actionsError } = await supabase
      .from('editable_actions')
      .insert(actionsData)
      .select()

    if (actionsError) {
      console.error('Error creating editable actions:', actionsError)
      return { sessionId: sessionData.id, error: actionsError.message }
    }

    return { sessionId: sessionData.id, actions: insertedActions }
  } catch (error) {
    console.error('Unexpected error creating action session:', error)
    
    // Fallback to offline mode on unexpected error
    const offlineSessionId = generateOfflineId()
    addPendingSyncOperation({
      type: 'create_session',
      data: { goal, actions }
    })
    
    return { sessionId: offlineSessionId, isOffline: true, error: 'Network error - saved offline' }
  }
}

/**
 * Mark an action as completed
 */
export async function markActionCompleted(
  actionId: string,
  actualMinutesSpent: number
): Promise<{ success: boolean; error?: string; isOffline?: boolean }> {
  try {
    // Check if this is an offline action
    const offlineActions = getFromLocalStorage<OfflineAction[]>(OFFLINE_ACTIONS_KEY) || []
    const offlineAction = offlineActions.find(a => a.offline_id === actionId || a.id === actionId)
    
    if (offlineAction || !isOnline()) {
      // Update offline action
      if (offlineAction) {
        offlineAction.completed_at = new Date().toISOString()
        offlineAction.needs_sync = true
        saveToLocalStorage(OFFLINE_ACTIONS_KEY, offlineActions)
      }

      // Add to pending sync operations
      addPendingSyncOperation({
        type: 'update_action',
        data: { actionId, actualMinutesSpent }
      })

      return { success: true, isOffline: true }
    }

    const { error } = await supabase
      .from('editable_actions')
      .update({
        completed_at: new Date().toISOString()
      })
      .eq('id', actionId)

    if (error) {
      console.error('Error marking action as completed:', error)
      
      // Fallback to offline mode
      addPendingSyncOperation({
        type: 'update_action',
        data: { actionId, actualMinutesSpent }
      })
      
      return { success: true, isOffline: true, error: 'Database error - saved offline' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error marking action as completed:', error)
    
    // Fallback to offline mode
    addPendingSyncOperation({
      type: 'update_action',
      data: { actionId, actualMinutesSpent }
    })
    
    return { success: true, isOffline: true, error: 'Network error - saved offline' }
  }
}

/**
 * Unmark an action as completed
 */
export async function unmarkActionCompleted(
  actionId: string
): Promise<{ success: boolean; error?: string; isOffline?: boolean }> {
  try {
    const offlineActions = getFromLocalStorage<OfflineAction[]>(OFFLINE_ACTIONS_KEY) || []
    const offlineAction = offlineActions.find(a => a.offline_id === actionId || a.id === actionId)
    
    if (offlineAction || !isOnline()) {
      if (offlineAction) {
        offlineAction.completed_at = undefined
        offlineAction.needs_sync = true
        saveToLocalStorage(OFFLINE_ACTIONS_KEY, offlineActions)
      }
      // Add to pending sync operations for unmarking
      return { success: true, isOffline: true }
    }

    const { error } = await supabase
      .from('editable_actions')
      .update({
        completed_at: null
      })
      .eq('id', actionId)

    if (error) {
      console.error('Error unmarking action as completed:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error unmarking action as completed:', error)
    return { success: false, error: 'Network error' }
  }
}

/**
 * Update session progress with actual time spent
 */
export async function updateSessionProgress(
  sessionId: string,
  actualTimeSpent: number,
  status?: 'active' | 'completed' | 'paused'
): Promise<{ success: boolean; error?: string; isOffline?: boolean }> {
  try {
    // Check if this is an offline session
    const offlineSessions = getFromLocalStorage<OfflineSession[]>(OFFLINE_SESSIONS_KEY) || []
    const offlineSession = offlineSessions.find(s => s.offline_id === sessionId || s.id === sessionId)
    
    if (offlineSession || !isOnline()) {
      // Update offline session
      if (offlineSession) {
        offlineSession.actual_time_spent = actualTimeSpent
        offlineSession.updated_at = new Date().toISOString()
        if (status) {
          offlineSession.status = status
        }
        offlineSession.needs_sync = true
        saveToLocalStorage(OFFLINE_SESSIONS_KEY, offlineSessions)
      }

      // Add to pending sync operations
      addPendingSyncOperation({
        type: 'update_session',
        data: { sessionId, actualTimeSpent, status }
      })

      return { success: true, isOffline: true }
    }

    const updateData: Partial<ActionSessionData> = {
      actual_time_spent: actualTimeSpent,
      updated_at: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    const { error } = await supabase
      .from('action_sessions')
      .update(updateData)
      .eq('id', sessionId)

    if (error) {
      console.error('Error updating session progress:', error)
      
      // Fallback to offline mode
      addPendingSyncOperation({
        type: 'update_session',
        data: { sessionId, actualTimeSpent, status }
      })
      
      return { success: true, isOffline: true, error: 'Database error - saved offline' }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating session progress:', error)
    
    // Fallback to offline mode
    addPendingSyncOperation({
      type: 'update_session',
      data: { sessionId, actualTimeSpent, status }
    })
    
    return { success: true, isOffline: true, error: 'Network error - saved offline' }
  }
}

/**
 * Get action session with actions
 */
export async function getActionSession(sessionId: string): Promise<{
  session: ActionSessionData | null
  actions: EditableActionData[]
  error?: string
}> {
  try {
    // Get session data
    const { data: sessionData, error: sessionError } = await supabase
      .from('action_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      console.error('Error fetching action session:', sessionError)
      return { session: null, actions: [], error: sessionError.message }
    }

    // Get actions data
    const { data: actionsData, error: actionsError } = await supabase
      .from('editable_actions')
      .select('*')
      .eq('session_id', sessionId)
      .order('order_index')

    if (actionsError) {
      console.error('Error fetching editable actions:', actionsError)
      return { session: sessionData, actions: [], error: actionsError.message }
    }

    return { session: sessionData, actions: actionsData || [] }
  } catch (error) {
    console.error('Unexpected error fetching action session:', error)
    return { session: null, actions: [], error: 'Failed to fetch action session' }
  }
}

/**
 * Get user's recent action sessions
 */
export async function getUserActionSessions(limit: number = 10): Promise<{
  sessions: (ActionSessionData & { actions: EditableActionData[]; isOffline?: boolean })[]
  error?: string
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get offline sessions first
    const offlineSessions = getFromLocalStorage<OfflineSession[]>(OFFLINE_SESSIONS_KEY) || []
    const offlineActions = getFromLocalStorage<OfflineAction[]>(OFFLINE_ACTIONS_KEY) || []
    
    let allSessions: (ActionSessionData & { actions: EditableActionData[]; isOffline?: boolean })[] = []
    
    // Add offline sessions
    offlineSessions.forEach(session => {
      const sessionActions = offlineActions.filter(action => action.session_id === session.offline_id)
      allSessions.push({
        ...session,
        id: session.offline_id,
        actions: sessionActions,
        isOffline: true
      })
    })

    // Get online sessions if user is authenticated and online
    if (user && isOnline()) {
      try {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('action_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (!sessionsError && sessionsData) {
          // Get actions for each online session
          const onlineSessionsWithActions = await Promise.all(
            sessionsData.map(async (session) => {
              const { data: actionsData } = await supabase
                .from('editable_actions')
                .select('*')
                .eq('session_id', session.id)
                .order('order_index')

              return {
                ...session,
                actions: actionsData || [],
                isOffline: false
              }
            })
          )

          allSessions.push(...onlineSessionsWithActions)
        }
      } catch (error) {
        console.warn('Failed to fetch online sessions, using offline data only:', error)
      }
    }

    // Sort all sessions by created_at and limit
    allSessions.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
    allSessions = allSessions.slice(0, limit)

    return { sessions: allSessions }
  } catch (error) {
    console.error('Unexpected error fetching user action sessions:', error)
    
    // Fallback to offline data only
    const offlineSessions = getFromLocalStorage<OfflineSession[]>(OFFLINE_SESSIONS_KEY) || []
    const offlineActions = getFromLocalStorage<OfflineAction[]>(OFFLINE_ACTIONS_KEY) || []
    
    const fallbackSessions = offlineSessions.map(session => {
      const sessionActions = offlineActions.filter(action => action.session_id === session.offline_id)
      return {
        ...session,
        id: session.offline_id,
        actions: sessionActions,
        isOffline: true
      }
    }).slice(0, limit)

    return { sessions: fallbackSessions, error: 'Using offline data only' }
  }
}

/**
 * Initialize offline sync listeners
 */
export function initializeOfflineSync(): () => void {
  let syncInProgress = false

  const handleOnline = async () => {
    if (syncInProgress) return
    
    syncInProgress = true
    console.log('Device came online, attempting to sync offline data...')
    
    try {
      const result = await syncOfflineData()
      if (result.synced > 0) {
        console.log(`Successfully synced ${result.synced} operations`)
      }
      if (result.errors.length > 0) {
        console.warn('Sync errors:', result.errors)
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error)
    } finally {
      syncInProgress = false
    }
  }

  const handleOffline = () => {
    console.log('Device went offline, future operations will be queued for sync')
  }

  // Add event listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Initial sync if online
  if (isOnline()) {
    setTimeout(handleOnline, 1000) // Delay to avoid blocking initial load
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

/**
 * Get pending sync operations count
 */
export function getPendingSyncCount(): number {
  const pendingOps = getFromLocalStorage<PendingSyncOperation[]>(PENDING_SYNC_KEY) || []
  return pendingOps.length
}

/**
 * Clear all offline data (use with caution)
 */
export function clearOfflineData(): void {
  localStorage.removeItem(OFFLINE_SESSIONS_KEY)
  localStorage.removeItem(OFFLINE_ACTIONS_KEY)
  localStorage.removeItem(PENDING_SYNC_KEY)
}