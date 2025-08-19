/**
 * Unit tests for timer utility functions
 * This satisfies requirement 9.1-9.4 (minimal testing for hackathon scope)
 */

import { 
  calculateVariance, 
  formatTime, 
  minutesToSeconds, 
  getVarianceMessage,
  calculateAdjustedElapsed 
} from '../timer-utils'

describe('Timer Utilities', () => {
  describe('calculateVariance', () => {
    it('should calculate positive variance when over time', () => {
      // 25 minutes planned, 30 minutes actual = +20% variance
      const result = calculateVariance(1500, 1800) // 25min vs 30min in seconds
      expect(result).toBe(20)
    })

    it('should calculate negative variance when under time', () => {
      // 25 minutes planned, 20 minutes actual = -20% variance
      const result = calculateVariance(1500, 1200) // 25min vs 20min in seconds
      expect(result).toBe(-20)
    })

    it('should return 0 for perfect timing', () => {
      const result = calculateVariance(1500, 1500)
      expect(result).toBe(0)
    })

    it('should return 0 when planned duration is 0', () => {
      const result = calculateVariance(0, 100)
      expect(result).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      // 1500 seconds planned, 1510 seconds actual = 0.67% variance
      const result = calculateVariance(1500, 1510)
      expect(result).toBe(0.67)
    })
  })

  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00')
      expect(formatTime(59)).toBe('00:59')
      expect(formatTime(60)).toBe('01:00')
      expect(formatTime(125)).toBe('02:05')
      expect(formatTime(3661)).toBe('61:01') // Over 60 minutes
    })
  })

  describe('minutesToSeconds', () => {
    it('should convert minutes to seconds', () => {
      expect(minutesToSeconds(1)).toBe(60)
      expect(minutesToSeconds(25)).toBe(1500)
      expect(minutesToSeconds(45)).toBe(2700)
      expect(minutesToSeconds(50)).toBe(3000)
    })
  })

  describe('getVarianceMessage', () => {
    it('should return perfect timing message for small variance', () => {
      const message = getVarianceMessage(2, 25, 25)
      expect(message).toContain('Perfect timing')
      expect(message).toContain('🎯')
    })

    it('should return positive message for over time', () => {
      const message = getVarianceMessage(15, 25, 29)
      expect(message).toContain('deep focus')
      expect(message).toContain('💪')
    })

    it('should return efficiency message for under time', () => {
      const message = getVarianceMessage(-15, 25, 21)
      expect(message).toContain('efficiency')
      expect(message).toContain('⚡')
    })
  })

  describe('calculateAdjustedElapsed', () => {
    it('should calculate elapsed time without paused duration', () => {
      const startTime = new Date(Date.now() - 10000) // 10 seconds ago
      const pausedTime = 3000 // 3 seconds paused
      
      const result = calculateAdjustedElapsed(startTime, pausedTime)
      
      // Should be approximately 7 seconds (10 - 3)
      expect(result).toBeGreaterThanOrEqual(6)
      expect(result).toBeLessThanOrEqual(8)
    })

    it('should not return negative values', () => {
      const startTime = new Date(Date.now() - 1000) // 1 second ago
      const pausedTime = 5000 // 5 seconds paused (more than elapsed)
      
      const result = calculateAdjustedElapsed(startTime, pausedTime)
      expect(result).toBe(0)
    })
  })
})