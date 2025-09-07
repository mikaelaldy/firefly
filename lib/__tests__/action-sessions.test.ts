/**
 * Unit tests for ActionSession service
 * This verifies CRUD operations and offline sync functionality
 */

import { vi, beforeEach, describe, it, expect } from 'vitest'
import type { EditableAction } from '@/types'

// Mock Supabase client before importing the service
vi.mock('../supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } })
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null })
        })
      })
    })
  }
}))

// Now import the service after mocking
const { 
  createActionSession, 
  markActionCompleted, 
  updateSessionProgress,
  getActionSession,
  getUserActionSessions,
  clearOfflineData
} = await import('../supabase/action-sessions')

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

// Mock navigator.onLine
Object.defineProperty(global, 'navigator', {
  value: {
    onLine: false // Start offline for testing
  },
  writable: true
})

describe('ActionSession Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    // Set offline mode for predictable testing
    Object.defineProperty(navigator, 'onLine', { value: false })
  })

  describe('createActionSession', () => {
    it('should create action session offline when navigator is offline', async () => {
      const goal = 'Complete project documentation'
      const actions: EditableAction[] = [
        {
          id: 'action-1',
          text: 'Write introduction',
          estimatedMinutes: 15,
          confidence: 'high',
          isCustom: false
        },
        {
          id: 'action-2', 
          text: 'Create diagrams',
          estimatedMinutes: 30,
          confidence: 'medium',
          isCustom: false
        }
      ]

      const result = await createActionSession(goal, actions)

      expect(result.sessionId).toBeDefined()
      expect(result.sessionId).toMatch(/^offline_/)
      expect(result.isOffline).toBe(true)
      expect(result.error).toBeDefined()

      // Verify offline data was saved
      const offlineSessions = JSON.parse(localStorageMock.getItem('firefly_offline_sessions') || '[]')
      expect(offlineSessions).toHaveLength(1)
      expect(offlineSessions[0].goal).toBe(goal)
      expect(offlineSessions[0].total_estimated_time).toBe(45) // 15 + 30

      const offlineActions = JSON.parse(localStorageMock.getItem('firefly_offline_actions') || '[]')
      expect(offlineActions).toHaveLength(2)
      expect(offlineActions[0].text).toBe('Write introduction')
      expect(offlineActions[1].text).toBe('Create diagrams')
    })

    it('should calculate total estimated time correctly', async () => {
      const goal = 'Test task'
      const actions: EditableAction[] = [
        { id: '1', text: 'Action 1', estimatedMinutes: 10, isCustom: false },
        { id: '2', text: 'Action 2', estimatedMinutes: 20, isCustom: false },
        { id: '3', text: 'Action 3', estimatedMinutes: 5, isCustom: false }
      ]

      const result = await createActionSession(goal, actions)

      const offlineSessions = JSON.parse(localStorageMock.getItem('firefly_offline_sessions') || '[]')
      expect(offlineSessions[0].total_estimated_time).toBe(35) // 10 + 20 + 5
    })
  })

  describe('markActionCompleted', () => {
    it('should mark action as completed offline', async () => {
      // First create a session with actions
      const goal = 'Test completion'
      const actions: EditableAction[] = [
        { id: 'action-1', text: 'Test action', estimatedMinutes: 15, isCustom: false }
      ]

      await createActionSession(goal, actions)

      // Mark action as completed
      const result = await markActionCompleted('action-1', 12)

      expect(result.success).toBe(true)
      expect(result.isOffline).toBe(true)

      // Verify pending sync operation was created
      const pendingOps = JSON.parse(localStorageMock.getItem('firefly_pending_sync') || '[]')
      expect(pendingOps).toHaveLength(2) // create_session + update_action
      expect(pendingOps[1].type).toBe('update_action')
      expect(pendingOps[1].data.actionId).toBe('action-1')
      expect(pendingOps[1].data.actualMinutesSpent).toBe(12)
    })
  })

  describe('updateSessionProgress', () => {
    it('should update session progress offline', async () => {
      // Create a session first
      const result = await createActionSession('Test session', [])
      const sessionId = result.sessionId!

      // Update progress
      const updateResult = await updateSessionProgress(sessionId, 25, 'completed')

      expect(updateResult.success).toBe(true)
      expect(updateResult.isOffline).toBe(true)

      // Verify offline session was updated
      const offlineSessions = JSON.parse(localStorageMock.getItem('firefly_offline_sessions') || '[]')
      expect(offlineSessions[0].actual_time_spent).toBe(25)
      expect(offlineSessions[0].status).toBe('completed')
    })
  })

  describe('getUserActionSessions', () => {
    it('should return offline sessions when offline', async () => {
      // Create some offline sessions
      await createActionSession('Session 1', [
        { id: '1', text: 'Action 1', estimatedMinutes: 10, isCustom: false }
      ])
      await createActionSession('Session 2', [
        { id: '2', text: 'Action 2', estimatedMinutes: 15, isCustom: false }
      ])

      const result = await getUserActionSessions(5)

      expect(result.sessions).toHaveLength(2)
      // Verify sessions are returned (order may vary in test environment)
      const sessionGoals = result.sessions.map(s => s.goal)
      expect(sessionGoals).toContain('Session 1')
      expect(sessionGoals).toContain('Session 2')
      expect(result.sessions[0].isOffline).toBe(true)
      expect(result.sessions.find(s => s.goal === 'Session 1')?.actions).toHaveLength(1)
    })

    it('should limit results correctly', async () => {
      // Create 3 sessions
      for (let i = 1; i <= 3; i++) {
        await createActionSession(`Session ${i}`, [])
      }

      const result = await getUserActionSessions(2)

      expect(result.sessions).toHaveLength(2)
      // Verify we get 2 sessions from the 3 created
      const sessionGoals = result.sessions.map(s => s.goal)
      expect(sessionGoals.every(goal => ['Session 1', 'Session 2', 'Session 3'].includes(goal))).toBe(true)
    })
  })

  describe('offline data management', () => {
    it('should clear offline data correctly', () => {
      // Add some offline data
      localStorageMock.setItem('firefly_offline_sessions', JSON.stringify([{ id: 'test' }]))
      localStorageMock.setItem('firefly_offline_actions', JSON.stringify([{ id: 'test' }]))
      localStorageMock.setItem('firefly_pending_sync', JSON.stringify([{ id: 'test' }]))

      clearOfflineData()

      expect(localStorageMock.getItem('firefly_offline_sessions')).toBeNull()
      expect(localStorageMock.getItem('firefly_offline_actions')).toBeNull()
      expect(localStorageMock.getItem('firefly_pending_sync')).toBeNull()
    })
  })
})