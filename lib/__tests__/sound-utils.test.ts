/**
 * Sound utilities tests
 * Tests sound management and break management functionality
 */

import { vi, beforeEach, describe, it, expect } from 'vitest'
import { soundManager, breakManager, formatBreakMessage, getBreakSuggestions } from '../sound-utils'

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

// Mock Web Audio API
const mockAudioContext = {
  createBuffer: vi.fn().mockReturnValue({
    getChannelData: vi.fn().mockReturnValue(new Float32Array(1000)),
    length: 1000
  }),
  sampleRate: 44100,
  state: 'running',
  resume: vi.fn().mockResolvedValue(undefined)
}

Object.defineProperty(global, 'AudioContext', {
  value: vi.fn().mockImplementation(() => mockAudioContext)
})

Object.defineProperty(global, 'webkitAudioContext', {
  value: vi.fn().mockImplementation(() => mockAudioContext)
})

// Mock HTML Audio element
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  currentTime: 0,
  volume: 0.5,
  preload: 'auto'
}

Object.defineProperty(global, 'Audio', {
  value: vi.fn().mockImplementation(() => mockAudio)
})

// Mock URL.createObjectURL
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn().mockReturnValue('blob:mock-url')
  }
})

describe('Sound Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('SoundManager', () => {
    it('should initialize with default config', () => {
      const config = soundManager.getConfig()
      
      expect(config.enabled).toBe(true)
      expect(config.volume).toBe(0.5)
      expect(config.tickingEnabled).toBe(true)
      expect(config.alarmEnabled).toBe(true)
      expect(config.breakNotificationsEnabled).toBe(true)
    })

    it('should update config and save to localStorage', () => {
      soundManager.updateConfig({ volume: 0.8, tickingEnabled: false })
      
      const config = soundManager.getConfig()
      expect(config.volume).toBe(0.8)
      expect(config.tickingEnabled).toBe(false)
      
      // Check localStorage
      const saved = JSON.parse(localStorageMock.getItem('firefly_sound_config') || '{}')
      expect(saved.volume).toBe(0.8)
      expect(saved.tickingEnabled).toBe(false)
    })

    it('should play sounds when enabled', () => {
      soundManager.updateConfig({ enabled: true, alarmEnabled: true })
      soundManager.playSound('alarm')
      
      expect(mockAudio.play).toHaveBeenCalled()
    })

    it('should not play sounds when disabled', () => {
      soundManager.updateConfig({ enabled: false })
      soundManager.playSound('alarm')
      
      expect(mockAudio.play).not.toHaveBeenCalled()
    })

    it('should not play ticking when ticking is disabled', () => {
      soundManager.updateConfig({ enabled: true, tickingEnabled: false })
      soundManager.playSound('tick')
      
      expect(mockAudio.play).not.toHaveBeenCalled()
    })

    it('should request audio permission', async () => {
      const hasPermission = await soundManager.requestAudioPermission()
      expect(hasPermission).toBe(true)
    })
  })

  describe('BreakManager', () => {
    it('should start with session count 0', () => {
      expect(breakManager.getSessionCount()).toBe(0)
    })

    it('should provide short breaks for sessions 1-3', () => {
      const break1 = breakManager.completeSession()
      expect(break1?.type).toBe('short')
      expect(break1?.duration).toBe(5)
      expect(break1?.sessionCount).toBe(1)

      const break2 = breakManager.completeSession()
      expect(break2?.type).toBe('short')
      expect(break2?.sessionCount).toBe(2)

      const break3 = breakManager.completeSession()
      expect(break3?.type).toBe('short')
      expect(break3?.sessionCount).toBe(3)
    })

    it('should provide long break for 4th session', () => {
      // Complete 4 sessions
      breakManager.completeSession() // 1
      breakManager.completeSession() // 2
      breakManager.completeSession() // 3
      const break4 = breakManager.completeSession() // 4

      expect(break4?.type).toBe('long')
      expect(break4?.duration).toBe(15)
      expect(break4?.sessionCount).toBe(4)
    })

    it('should cycle back to short breaks after long break', () => {
      // Complete 5 sessions (4 + 1)
      for (let i = 0; i < 4; i++) {
        breakManager.completeSession()
      }
      const break5 = breakManager.completeSession()

      expect(break5?.type).toBe('short')
      expect(break5?.sessionCount).toBe(5)
    })

    it('should provide next break info', () => {
      const nextBreak = breakManager.getNextBreakInfo()
      expect(nextBreak.type).toBe('short')
      expect(nextBreak.duration).toBe(5)

      // After 3 sessions, next should be long
      breakManager.completeSession()
      breakManager.completeSession()
      breakManager.completeSession()
      
      const nextLongBreak = breakManager.getNextBreakInfo()
      expect(nextLongBreak.type).toBe('long')
      expect(nextLongBreak.duration).toBe(15)
    })

    it('should reset session count', () => {
      breakManager.completeSession()
      breakManager.completeSession()
      expect(breakManager.getSessionCount()).toBe(2)

      breakManager.resetSessionCount()
      expect(breakManager.getSessionCount()).toBe(0)
    })

    it('should persist session count in localStorage', () => {
      breakManager.completeSession()
      breakManager.completeSession()

      // Check localStorage
      const saved = localStorageMock.getItem('firefly_session_count')
      expect(saved).toBe('2')
    })
  })

  describe('Utility Functions', () => {
    it('should format break messages correctly', () => {
      const shortBreak = {
        type: 'short' as const,
        duration: 5,
        sessionCount: 1
      }

      const longBreak = {
        type: 'long' as const,
        duration: 15,
        sessionCount: 4
      }

      const shortMessage = formatBreakMessage(shortBreak)
      expect(shortMessage).toContain('5-minute break')
      expect(shortMessage).toContain('✨')

      const longMessage = formatBreakMessage(longBreak)
      expect(longMessage).toContain('15-minute long break')
      expect(longMessage).toContain('🎉')
      expect(longMessage).toContain('4 focus sessions')
    })

    it('should provide different suggestions for short and long breaks', () => {
      const shortSuggestions = getBreakSuggestions('short')
      const longSuggestions = getBreakSuggestions('long')

      expect(shortSuggestions.length).toBeGreaterThan(0)
      expect(longSuggestions.length).toBeGreaterThan(0)
      expect(shortSuggestions).not.toEqual(longSuggestions)

      // Short breaks should have quick activities
      expect(shortSuggestions.some(s => s.includes('water'))).toBe(true)
      expect(shortSuggestions.some(s => s.includes('stretch'))).toBe(true)

      // Long breaks should have more substantial activities
      expect(longSuggestions.some(s => s.includes('walk'))).toBe(true)
      expect(longSuggestions.some(s => s.includes('meditation'))).toBe(true)
    })
  })
})