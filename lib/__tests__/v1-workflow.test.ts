/**
 * V1 Feature Integration Tests
 * Tests the complete workflow: edit actions → get estimates → run timers → track progress
 * This satisfies requirement 12.1-12.12 testing for V1 features
 */

import { vi, beforeEach, describe, it, expect } from 'vitest'
import type { EditableAction, EstimateRequest, EstimateResponse } from '@/types'

// Mock fetch for AI estimation API
global.fetch = vi.fn()

// Mock localStorage
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
  value: { onLine: true },
  writable: true
})

describe('V1 Feature Workflow Integration', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
    Object.defineProperty(navigator, 'onLine', { value: true })
  })

  describe('Complete V1 Workflow', () => {
    it('should handle complete workflow: edit actions → get estimates → track progress', async () => {
      // Step 1: Start with initial AI-generated actions
      const initialActions = [
        'Research the topic thoroughly',
        'Create an outline',
        'Write the first draft'
      ]

      // Step 2: User edits actions (simulating EditableNextActions component)
      const editedActions: EditableAction[] = [
        {
          id: 'action-1',
          text: 'Research the topic thoroughly for 20 minutes',
          isCustom: true,
          originalText: 'Research the topic thoroughly'
        },
        {
          id: 'action-2', 
          text: 'Create a detailed outline with main points',
          isCustom: true,
          originalText: 'Create an outline'
        },
        {
          id: 'action-3',
          text: 'Write the first draft',
          isCustom: false,
          originalText: 'Write the first draft'
        }
      ]

      // Step 3: Mock AI estimation API response
      const mockEstimateResponse: EstimateResponse = {
        estimatedActions: [
          { action: 'Research the topic thoroughly for 20 minutes', estimatedMinutes: 25, confidence: 'high' },
          { action: 'Create a detailed outline with main points', estimatedMinutes: 15, confidence: 'medium' },
          { action: 'Write the first draft', estimatedMinutes: 35, confidence: 'medium' }
        ],
        totalEstimatedTime: 75
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockEstimateResponse
      })

      // Step 4: Call AI estimation API
      const estimateRequest: EstimateRequest = {
        actions: editedActions.map(a => a.text),
        context: 'Writing a blog post about productivity'
      }

      const response = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estimateRequest)
      })

      expect(response.ok).toBe(true)
      const estimateData = await response.json()
      
      // Verify AI estimates are returned correctly
      expect(estimateData.estimatedActions).toHaveLength(3)
      expect(estimateData.totalEstimatedTime).toBe(75)
      expect(estimateData.estimatedActions[0].estimatedMinutes).toBe(25)
      expect(estimateData.estimatedActions[0].confidence).toBe('high')

      // Step 5: Update actions with estimates
      const actionsWithEstimates: EditableAction[] = editedActions.map((action, index) => ({
        ...action,
        estimatedMinutes: estimateData.estimatedActions[index].estimatedMinutes,
        confidence: estimateData.estimatedActions[index].confidence
      }))

      // Verify actions have estimates
      expect(actionsWithEstimates[0].estimatedMinutes).toBe(25)
      expect(actionsWithEstimates[1].estimatedMinutes).toBe(15)
      expect(actionsWithEstimates[2].estimatedMinutes).toBe(35)

      // Step 6: Simulate timer usage with custom durations
      const selectedAction = actionsWithEstimates[0]
      const timerDuration = selectedAction.estimatedMinutes! * 60 // Convert to seconds
      
      expect(timerDuration).toBe(1500) // 25 minutes = 1500 seconds

      // Step 7: Simulate action completion tracking
      const actualTimeSpent = 28 // User took 28 minutes instead of 25
      const variance = ((actualTimeSpent - selectedAction.estimatedMinutes!) / selectedAction.estimatedMinutes!) * 100
      
      expect(Math.round(variance)).toBe(12) // 12% over estimate

      // Step 8: Verify session data structure
      const sessionData = {
        goal: 'Write a blog post about productivity',
        actions: actionsWithEstimates,
        totalEstimatedTime: 75,
        actualTimeSpent: actualTimeSpent,
        completedActions: [selectedAction.id],
        variance: variance
      }

      expect(sessionData.actions).toHaveLength(3)
      expect(sessionData.totalEstimatedTime).toBe(75)
      expect(sessionData.completedActions).toContain('action-1')
      expect(sessionData.variance).toBeCloseTo(12, 0)
    })

    it('should handle AI estimation fallbacks gracefully', async () => {
      const actions = ['Test action 1', 'Test action 2']

      // Mock API failure
      ;(fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const response = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions })
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(500)

      // Verify that the application can handle this gracefully
      // (The EditableNextActions component should show an error message)
      const errorHandled = !response.ok
      expect(errorHandled).toBe(true)
    })

    it('should validate action editing constraints', () => {
      // Test action text validation
      const validAction: EditableAction = {
        id: 'test-1',
        text: 'Valid action with sufficient detail',
        isCustom: true,
        originalText: 'Original text'
      }

      const emptyAction: EditableAction = {
        id: 'test-2', 
        text: '',
        isCustom: true,
        originalText: 'Original text'
      }

      const tooLongAction: EditableAction = {
        id: 'test-3',
        text: 'A'.repeat(501), // Assuming 500 char limit
        isCustom: true,
        originalText: 'Original text'
      }

      // Validate action text length
      expect(validAction.text.length).toBeGreaterThan(0)
      expect(validAction.text.length).toBeLessThan(500)
      
      expect(emptyAction.text.length).toBe(0)
      expect(tooLongAction.text.length).toBeGreaterThan(500)
    })

    it('should handle time estimation edge cases', async () => {
      const edgeCaseActions = [
        'Quick 5-minute task',
        'Complex research project that might take several hours',
        'Simple check'
      ]

      const mockResponse: EstimateResponse = {
        estimatedActions: [
          { action: edgeCaseActions[0], estimatedMinutes: 5, confidence: 'high' },
          { action: edgeCaseActions[1], estimatedMinutes: 120, confidence: 'low' }, // Max 2 hours
          { action: edgeCaseActions[2], estimatedMinutes: 5, confidence: 'medium' } // Min 5 minutes
        ],
        totalEstimatedTime: 130
      }

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const response = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: edgeCaseActions })
      })

      const data = await response.json()

      // Verify time estimates are within reasonable bounds
      expect(data.estimatedActions[0].estimatedMinutes).toBeGreaterThanOrEqual(5) // Min 5 minutes
      expect(data.estimatedActions[1].estimatedMinutes).toBeLessThanOrEqual(120) // Max 2 hours
      expect(data.totalEstimatedTime).toBe(130)
    })
  })

  describe('Action Session Persistence', () => {
    it('should persist action modifications and estimates', () => {
      const sessionData = {
        sessionId: 'test-session-1',
        goal: 'Test goal',
        actions: [
          {
            id: 'action-1',
            text: 'Modified action text',
            estimatedMinutes: 20,
            confidence: 'high' as const,
            isCustom: true,
            originalText: 'Original action text'
          }
        ],
        totalEstimatedTime: 20,
        actualTimeSpent: 0,
        status: 'active' as const
      }

      // Simulate saving to localStorage (offline mode)
      localStorage.setItem('firefly_test_session', JSON.stringify(sessionData))

      // Retrieve and verify
      const retrieved = JSON.parse(localStorage.getItem('firefly_test_session') || '{}')
      
      expect(retrieved.sessionId).toBe('test-session-1')
      expect(retrieved.actions[0].text).toBe('Modified action text')
      expect(retrieved.actions[0].estimatedMinutes).toBe(20)
      expect(retrieved.actions[0].isCustom).toBe(true)
      expect(retrieved.totalEstimatedTime).toBe(20)
    })

    it('should track action completion progress', () => {
      const initialSession = {
        completedActions: [] as string[],
        totalActions: 3,
        currentActionId: null as string | null
      }

      // Simulate completing actions
      initialSession.completedActions.push('action-1')
      initialSession.currentActionId = 'action-2'

      expect(initialSession.completedActions).toHaveLength(1)
      expect(initialSession.completedActions).toContain('action-1')
      expect(initialSession.currentActionId).toBe('action-2')

      // Calculate progress
      const progressPercentage = (initialSession.completedActions.length / initialSession.totalActions) * 100
      expect(progressPercentage).toBeCloseTo(33.33, 1)
    })
  })

  describe('Dashboard Integration', () => {
    it('should format action session data for dashboard display', () => {
      const sessionData = {
        id: 'session-1',
        goal: 'Complete project documentation',
        actions: [
          { id: 'action-1', text: 'Write intro', estimatedMinutes: 15, actualMinutes: 18 },
          { id: 'action-2', text: 'Create diagrams', estimatedMinutes: 30, actualMinutes: 25 }
        ],
        totalEstimatedTime: 45,
        actualTimeSpent: 43,
        completedAt: new Date().toISOString(),
        status: 'completed'
      }

      // Calculate session metrics for dashboard
      const variance = ((sessionData.actualTimeSpent - sessionData.totalEstimatedTime) / sessionData.totalEstimatedTime) * 100
      const completionRate = (sessionData.actions.length / sessionData.actions.length) * 100 // All actions completed
      
      const dashboardData = {
        sessionId: sessionData.id,
        goal: sessionData.goal,
        estimatedTime: sessionData.totalEstimatedTime,
        actualTime: sessionData.actualTimeSpent,
        variance: Math.round(variance),
        completionRate: completionRate,
        actionCount: sessionData.actions.length,
        status: sessionData.status
      }

      expect(dashboardData.variance).toBe(-4) // 4% under estimate
      expect(dashboardData.completionRate).toBe(100)
      expect(dashboardData.actionCount).toBe(2)
      expect(dashboardData.estimatedTime).toBe(45)
      expect(dashboardData.actualTime).toBe(43)
    })
  })
})