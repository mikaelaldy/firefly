'use client'

// Local storage keys for offline data
export const OFFLINE_SESSIONS_KEY = 'firefly_offline_sessions'
export const OFFLINE_ACTIONS_KEY = 'firefly_offline_actions'
export const PENDING_SYNC_KEY = 'firefly_pending_sync'

// Offline data types
export interface OfflineSession {
  offline_id: string
  user_id?: string
  goal: string
  total_estimated_time?: number
  actual_time_spent?: number
  status?: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
  needs_sync: boolean
  sync_attempts: number
  last_sync_attempt?: string
}

export interface OfflineAction {
  offline_id: string
  session_id: string
  text: string
  estimated_minutes?: number
  confidence?: 'low' | 'medium' | 'high'
  is_custom?: boolean
  original_text?: string
  order_index: number
  completed_at?: string
  created_at: string
  needs_sync: boolean
  sync_attempts: number
  last_sync_attempt?: string
}

export interface PendingSyncOperation {
  id: string
  type: 'create_session' | 'update_session' | 'create_action' | 'update_action' | 'delete_action'
  data: any
  timestamp: string
  attempts: number
}

// Utility functions
export function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

export function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.warn('Failed to read from localStorage:', error)
    return null
  }
}

export function addPendingSyncOperation(operation: Omit<PendingSyncOperation, 'id' | 'timestamp' | 'attempts'>): void {
  const pendingOps = getFromLocalStorage<PendingSyncOperation[]>(PENDING_SYNC_KEY) || []
  
  const newOperation: PendingSyncOperation = {
    id: generateOfflineId(),
    timestamp: new Date().toISOString(),
    attempts: 0,
    ...operation
  }
  
  pendingOps.push(newOperation)
  saveToLocalStorage(PENDING_SYNC_KEY, pendingOps)
}