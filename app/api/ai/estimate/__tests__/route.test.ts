/**
 * AI Estimation API Tests
 * Tests the /api/ai/estimate endpoint for V1 features
 * Covers requirements 12.7, 12.8 for AI time estimation
 */

import { vi, beforeEach, describe, it, expect } from 'vitest'
import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock Google AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            estimatedActions: [
              { action: 'Test action', estimatedMinutes: 15, confidence: 'medium' }
            ],
            totalEstimatedTime: 15
          })
        }
      })
    })
  }))
}))

// Mock environment variable
process.env.GOOGLE_AI_API_KEY = 'test-api-key'

describe('/api/ai/estimate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Request Validation', () => {
    it('should reject empty actions array', async () => {
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ actions: [] })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('at least one action')
    })

    it('should reject non-array actions', async () => {
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ actions: 'not an array' })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Actions array is required')
    })

    it('should filter out empty action strings', async () => {
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: ['Valid action', '', '   ', 'Another valid action']
        })
      })

      const response = await POST(request)
      
      expect(response.status).toBe(200)
      // Should process only the 2 valid actions
    })

    it('should reject too many actions', async () => {
      const manyActions = Array(15).fill('Test action')
      
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ actions: manyActions })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Maximum 10 actions')
    })
  })

  describe('AI Estimation', () => {
    it('should return valid estimates for actions', async () => {
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: ['Write introduction', 'Create outline'],
          context: 'Blog post about productivity'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.estimatedActions).toBeDefined()
      expect(data.totalEstimatedTime).toBeDefined()
      expect(Array.isArray(data.estimatedActions)).toBe(true)
    })

    it('should handle AI service failures with fallback', async () => {
      // Mock AI failure
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockAI = GoogleGenerativeAI as any
      mockAI.mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockRejectedValue(new Error('AI service unavailable'))
        })
      }))

      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: ['Test action 1', 'Test action 2']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.estimatedActions).toHaveLength(2)
      expect(data.estimatedActions[0].estimatedMinutes).toBeGreaterThanOrEqual(5)
      expect(data.estimatedActions[0].estimatedMinutes).toBeLessThanOrEqual(120)
    })

    it('should clamp estimates to reasonable bounds', async () => {
      // Mock AI returning extreme values
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockAI = GoogleGenerativeAI as any
      mockAI.mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: () => JSON.stringify({
                estimatedActions: [
                  { action: 'Quick task', estimatedMinutes: 2, confidence: 'high' }, // Too low
                  { action: 'Long task', estimatedMinutes: 300, confidence: 'low' } // Too high
                ],
                totalEstimatedTime: 302
              })
            }
          })
        })
      }))

      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: ['Quick task', 'Long task']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.estimatedActions[0].estimatedMinutes).toBeGreaterThanOrEqual(5) // Clamped to minimum
      expect(data.estimatedActions[1].estimatedMinutes).toBeLessThanOrEqual(120) // Clamped to maximum
    })
  })

  describe('Fallback Estimation', () => {
    it('should provide reasonable fallback estimates', async () => {
      // Test the fallback function directly by mocking complete AI failure
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockAI = GoogleGenerativeAI as any
      mockAI.mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockRejectedValue(new Error('Complete AI failure'))
        })
      }))

      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: [
            'Research topic online',
            'Write first draft', 
            'Quick check of email',
            'Organize files and folders'
          ]
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.estimatedActions).toHaveLength(4)
      
      // Verify fallback logic
      const researchAction = data.estimatedActions.find((a: any) => a.action.includes('Research'))
      const writeAction = data.estimatedActions.find((a: any) => a.action.includes('Write'))
      const quickAction = data.estimatedActions.find((a: any) => a.action.includes('Quick'))
      const organizeAction = data.estimatedActions.find((a: any) => a.action.includes('Organize'))

      expect(researchAction?.estimatedMinutes).toBeGreaterThanOrEqual(20) // Research tasks get more time
      expect(writeAction?.estimatedMinutes).toBeGreaterThanOrEqual(15) // Write tasks get adequate time
      expect(quickAction?.estimatedMinutes).toBeLessThanOrEqual(15) // Quick tasks get less time
      expect(organizeAction?.estimatedMinutes).toBeGreaterThanOrEqual(10) // Organize tasks get moderate time
    })

    it('should adjust estimates based on action length', async () => {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockAI = GoogleGenerativeAI as any
      mockAI.mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockRejectedValue(new Error('AI failure'))
        })
      }))

      const shortAction = 'Check email'
      const longAction = 'Conduct comprehensive research on market trends, analyze competitor strategies, and prepare detailed report with recommendations for stakeholder review'

      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: [shortAction, longAction]
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      const shortEstimate = data.estimatedActions[0].estimatedMinutes
      const longEstimate = data.estimatedActions[1].estimatedMinutes

      expect(longEstimate).toBeGreaterThan(shortEstimate) // Longer description should get more time
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ actions: ['Test action'] }),
        headers: { 'x-forwarded-for': '192.168.1.100' }
      })

      // Make multiple requests rapidly
      const responses = await Promise.all([
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request),
        POST(request) // 16th request should be rate limited
      ])

      // At least one should be rate limited
      const rateLimitedResponses = responses.filter(r => r.status === 429)
      expect(rateLimitedResponses.length).toBeGreaterThan(0)
    })
  })

  describe('ADHD-Friendly Features', () => {
    it('should provide encouraging confidence levels', async () => {
      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: ['Simple task', 'Complex task']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      data.estimatedActions.forEach((action: any) => {
        expect(['low', 'medium', 'high']).toContain(action.confidence)
      })
    })

    it('should account for ADHD time optimism in estimates', async () => {
      // Fallback estimates should be slightly higher than neurotypical estimates
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const mockAI = GoogleGenerativeAI as any
      mockAI.mockImplementation(() => ({
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockRejectedValue(new Error('Use fallback'))
        })
      }))

      const request = new NextRequest('http://localhost/api/ai/estimate', {
        method: 'POST',
        body: JSON.stringify({ 
          actions: ['Write email', 'Read article', 'Make phone call']
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      
      // All estimates should be at least 10 minutes (accounting for ADHD task switching)
      data.estimatedActions.forEach((action: any) => {
        expect(action.estimatedMinutes).toBeGreaterThanOrEqual(10)
      })
    })
  })
})