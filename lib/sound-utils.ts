/**
 * Sound utilities for timer and break management
 * Provides ticking sounds, alarms, and break notifications
 */

export type SoundType = 'tick' | 'alarm' | 'break-start' | 'break-end'

interface SoundConfig {
  enabled: boolean
  volume: number
  tickingEnabled: boolean
  alarmEnabled: boolean
  breakNotificationsEnabled: boolean
  debugLogging: boolean // Added for debug logging control
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private config: SoundConfig = {
    enabled: true,
    volume: 0.5,
    tickingEnabled: true,
    alarmEnabled: true,
    breakNotificationsEnabled: true,
    debugLogging: false // Added for debug logging control
  }
  
  private tickingInterval: NodeJS.Timeout | null = null
  private audioElements: Map<SoundType, HTMLAudioElement> = new Map()
  private initialized = false

  constructor() {
    // Don't initialize during SSR
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private initialize(): void {
    if (this.initialized) return
    this.loadConfig()
    this.initializeAudioElements()
    this.initialized = true
  }

  private loadConfig(): void {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('firefly_sound_config')
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Failed to load sound config:', error)
    }
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('firefly_sound_config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save sound config:', error)
    }
  }

  private initializeAudioElements(): void {
    if (typeof window === 'undefined') return
    
    // Create audio elements for different sound types
    const sounds: Record<SoundType, string> = {
      tick: this.generateTickSound(),
      alarm: this.generateAlarmSound(),
      'break-start': this.generateBreakStartSound(),
      'break-end': this.generateBreakEndSound()
    }

    Object.entries(sounds).forEach(([type, dataUrl]) => {
      try {
        const audio = new Audio(dataUrl)
        audio.volume = this.config.volume
        audio.preload = 'auto'
        
        // Add error handling for audio loading
        audio.addEventListener('error', (e) => {
          console.warn(`Failed to load ${type} sound:`, e)
        })
        
        this.audioElements.set(type as SoundType, audio)
      } catch (error) {
        console.warn(`Failed to create audio element for ${type}:`, error)
      }
    })
  }

  private generateTickSound(): string {
    // Generate a subtle tick sound using Web Audio API
    try {
      if (typeof window === 'undefined') {
        return this.getFallbackTickSound()
      }
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const duration = 0.1 // 100ms
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
      const data = buffer.getChannelData(0)
    
      // Generate a short, subtle tick sound - more pronounced
      for (let i = 0; i < data.length; i++) {
        const t = i / sampleRate
        // Create a sharper, more audible tick
        const envelope = Math.exp(-t * 30) // Faster decay
        const frequency = 1200 // Higher frequency for better audibility
        data[i] = Math.sin(frequency * 2 * Math.PI * t) * envelope * 0.3 // Louder
      }
      
      console.log('Generated tick sound with Web Audio API')
      return this.bufferToDataUrl(buffer, audioContext)
    } catch (error) {
      console.warn('Web Audio API failed, using fallback:', error)
      return this.getFallbackTickSound()
    }
  }
  
  private getFallbackTickSound(): string {
    // Simple fallback tick sound - a short beep
    return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
  }

  private generateAlarmSound(): string {
    // Generate a pleasant but noticeable alarm sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
    
      // Generate a gentle alarm with multiple tones
      for (let i = 0; i < data.length; i++) {
        const t = i / audioContext.sampleRate
        const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 2)
        data[i] = (
          Math.sin(523 * 2 * Math.PI * t) * 0.3 + // C5
          Math.sin(659 * 2 * Math.PI * t) * 0.2 + // E5
          Math.sin(784 * 2 * Math.PI * t) * 0.1   // G5
        ) * envelope * 0.3
      }
      
      return this.bufferToDataUrl(buffer, audioContext)
    } catch (error) {
      // Fallback for environments without Web Audio API
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    }
  }

  private generateBreakStartSound(): string {
    // Generate a relaxing sound for break start
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 1.5, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < data.length; i++) {
        const t = i / audioContext.sampleRate
        const envelope = Math.exp(-t * 1.5)
        data[i] = (
          Math.sin(440 * 2 * Math.PI * t) * 0.2 + // A4
          Math.sin(554 * 2 * Math.PI * t) * 0.15  // C#5
        ) * envelope * 0.4
      }
      
      return this.bufferToDataUrl(buffer, audioContext)
    } catch (error) {
      // Fallback for environments without Web Audio API
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    }
  }

  private generateBreakEndSound(): string {
    // Generate an energizing sound for break end
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 1, audioContext.sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < data.length; i++) {
        const t = i / audioContext.sampleRate
        const envelope = Math.sin(t * Math.PI * 2) * Math.exp(-t * 3)
        data[i] = (
          Math.sin(523 * 2 * Math.PI * t) * 0.25 + // C5
          Math.sin(698 * 2 * Math.PI * t) * 0.2    // F5
        ) * envelope * 0.35
      }
      
      return this.bufferToDataUrl(buffer, audioContext)
    } catch (error) {
      // Fallback for environments without Web Audio API
      return 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2+LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    }
  }

  private bufferToDataUrl(buffer: AudioBuffer, audioContext: AudioContext): string {
    // Convert AudioBuffer to data URL for use with HTML Audio element
    const length = buffer.length
    const arrayBuffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, audioContext.sampleRate, true)
    view.setUint32(28, audioContext.sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * 2, true)
    
    // Convert float samples to 16-bit PCM
    const channelData = buffer.getChannelData(0)
    let offset = 44
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]))
      view.setInt16(offset, sample * 0x7FFF, true)
      offset += 2
    }
    
    const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
    return URL.createObjectURL(blob)
  }

  // Public methods
  public playSound(type: SoundType): void {
    if (typeof window === 'undefined') return
    this.initialize()
    
    // Only log for non-tick sounds or when debug logging is enabled
    if (type !== 'tick' || this.config.debugLogging) {
      console.log(`Attempting to play sound: ${type}`, {
        enabled: this.config.enabled,
        tickingEnabled: this.config.tickingEnabled,
        alarmEnabled: this.config.alarmEnabled,
        breakNotificationsEnabled: this.config.breakNotificationsEnabled,
        volume: this.config.volume
      })
    }
    
    if (!this.config.enabled) {
      if (type !== 'tick' || this.config.debugLogging) {
        console.log('Sound disabled globally')
      }
      return
    }
    
    const shouldPlay = 
      (type === 'tick' && this.config.tickingEnabled) ||
      (type === 'alarm' && this.config.alarmEnabled) ||
      ((type === 'break-start' || type === 'break-end') && this.config.breakNotificationsEnabled)
    
    if (!shouldPlay) {
      if (type !== 'tick' || this.config.debugLogging) {
        console.log(`Sound type ${type} is disabled`)
      }
      return
    }
    
    const audio = this.audioElements.get(type)
    if (audio) {
      if (type !== 'tick' || this.config.debugLogging) {
        console.log(`Playing ${type} sound, volume: ${this.config.volume}`)
      }
      
      audio.currentTime = 0
      audio.volume = this.config.volume
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.then(() => {
          if (type !== 'tick' || this.config.debugLogging) {
            console.log(`Successfully played ${type} sound`)
          }
        }).catch(error => {
          // Always log errors, even for tick sounds
          console.warn(`Failed to play ${type} sound:`, error)
        })
      }
    } else {
      // Always log missing audio elements
      console.warn(`No audio element found for ${type}`)
    }
  }

  public startTicking(): void {
    if (typeof window === 'undefined') return
    this.initialize()
    if (!this.config.enabled || !this.config.tickingEnabled) return
    
    this.stopTicking() // Clear any existing interval
    
    // Play tick every second
    this.tickingInterval = setInterval(() => {
      this.playSound('tick')
    }, 1000)
  }

  public stopTicking(): void {
    if (typeof window === 'undefined') return
    if (this.tickingInterval) {
      clearInterval(this.tickingInterval)
      this.tickingInterval = null
    }
  }

  public updateConfig(newConfig: Partial<SoundConfig>): void {
    if (typeof window === 'undefined') return
    this.initialize()
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
    
    // Update audio element volumes
    this.audioElements.forEach(audio => {
      audio.volume = this.config.volume
    })
  }

  public getConfig(): SoundConfig {
    if (typeof window === 'undefined') return this.config
    this.initialize()
    return { ...this.config }
  }

  public async enableAudioWithUserGesture(): Promise<boolean> {
    try {
      // This should be called from a user gesture (click, touch, etc.)
      console.log('Enabling audio with user gesture...')
      
      // Request audio permission
      const hasPermission = await this.requestAudioPermission()
      if (!hasPermission) {
        console.warn('Audio permission denied')
        return false
      }
      
      // Test play a silent tick to unlock audio
      const testAudio = this.audioElements.get('tick')
      if (testAudio) {
        const originalVolume = testAudio.volume
        testAudio.volume = 0.01 // Very quiet test
        try {
          await testAudio.play()
          testAudio.pause()
          testAudio.currentTime = 0
          testAudio.volume = originalVolume
          console.log('Audio unlocked successfully')
          return true
        } catch (error) {
          console.warn('Failed to unlock audio:', error)
          return false
        }
      }
      
      return false
    } catch (error) {
      console.warn('Error enabling audio:', error)
      return false
    }
  }

  public testTicking(): void {
    console.log('Testing ticking sound...')
    this.playSound('tick')
    
    // Test continuous ticking for 5 seconds
    let count = 0
    const testInterval = setInterval(() => {
      count++
      console.log(`Test tick ${count}`)
      this.playSound('tick')
      
      if (count >= 5) {
        clearInterval(testInterval)
        console.log('Test ticking completed')
      }
    }, 1000)
  }

  public async requestAudioPermission(): Promise<boolean> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return false
      }
      
      // Try to create audio context to ensure audio is available
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      // Test if we can actually play audio by trying to play a silent sound
      const testAudio = this.audioElements.get('tick')
      if (testAudio) {
        testAudio.volume = 0
        try {
          await testAudio.play()
          testAudio.pause()
          testAudio.currentTime = 0
          testAudio.volume = this.config.volume
        } catch (playError) {
          console.warn('Audio play test failed:', playError)
          return false
        }
      }
      
      return true
    } catch (error) {
      console.warn('Audio permission denied or not available:', error)
      return false
    }
  }

  // Debug logging methods
  public getDebugLogging(): boolean {
    return this.config.debugLogging
  }

  public setDebugLogging(enabled: boolean): void {
    this.config.debugLogging = enabled
    this.saveConfig()
    console.log(`Sound debug logging ${enabled ? 'enabled' : 'disabled'}`)
  }
}

// Singleton instance
export const soundManager = new SoundManager()

// Break management utilities
export interface BreakSession {
  type: 'short' | 'long'
  duration: number // in minutes
  sessionCount: number // which pomodoro session this follows
}

export class BreakManager {
  private sessionCount: number = 0
  private initialized = false
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }
  
  private initialize(): void {
    if (this.initialized) return
    this.loadSessionCount()
    this.initialized = true
  }
  
  private loadSessionCount(): void {
    if (typeof window === 'undefined') return
    
    try {
      const saved = localStorage.getItem('firefly_session_count')
      if (saved) {
        this.sessionCount = parseInt(saved, 10) || 0
      }
    } catch (error) {
      console.warn('Failed to load session count:', error)
    }
  }
  
  private saveSessionCount(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('firefly_session_count', this.sessionCount.toString())
    } catch (error) {
      console.warn('Failed to save session count:', error)
    }
  }
  
  public completeSession(): BreakSession | null {
    if (typeof window === 'undefined') return null
    this.initialize()
    this.sessionCount++
    this.saveSessionCount()
    
    // Determine break type based on session count
    if (this.sessionCount % 4 === 0) {
      // Every 4th session gets a long break (15 minutes)
      return {
        type: 'long',
        duration: 15,
        sessionCount: this.sessionCount
      }
    } else {
      // Other sessions get short breaks (5 minutes)
      return {
        type: 'short',
        duration: 5,
        sessionCount: this.sessionCount
      }
    }
  }
  
  public getSessionCount(): number {
    if (typeof window === 'undefined') return 0
    this.initialize()
    return this.sessionCount
  }
  
  public resetSessionCount(): void {
    if (typeof window === 'undefined') return
    this.initialize()
    this.sessionCount = 0
    this.saveSessionCount()
  }
  
  public getNextBreakInfo(): { type: 'short' | 'long'; duration: number } {
    if (typeof window === 'undefined') return { type: 'short', duration: 5 }
    this.initialize()
    const nextSession = this.sessionCount + 1
    if (nextSession % 4 === 0) {
      return { type: 'long', duration: 15 }
    } else {
      return { type: 'short', duration: 5 }
    }
  }
}

export const breakManager = new BreakManager()

// Utility functions
export function formatBreakMessage(breakSession: BreakSession): string {
  const { type, duration, sessionCount } = breakSession
  
  if (type === 'long') {
    return `🎉 Great work! You've completed ${sessionCount} focus sessions. Time for a ${duration}-minute long break to recharge.`
  } else {
    return `✨ Nice focus! Take a ${duration}-minute break before your next session.`
  }
}

export function getBreakSuggestions(type: 'short' | 'long'): string[] {
  if (type === 'long') {
    return [
      '🚶‍♀️ Take a walk outside',
      '🧘‍♂️ Do some stretching or meditation',
      '💧 Hydrate and have a healthy snack',
      '👀 Rest your eyes by looking at distant objects',
      '🎵 Listen to your favorite music',
      '📱 Check messages (but set a timer!)',
      '🌱 Water your plants or tidy up'
    ]
  } else {
    return [
      '💧 Drink some water',
      '👀 Look away from the screen',
      '🤸‍♂️ Do some quick stretches',
      '🫁 Take 5 deep breaths',
      '🚶‍♀️ Walk around the room',
      '☀️ Look out the window'
    ]
  }
}

// Global debug helper for development
declare global {
  interface Window {
    toggleSoundDebug?: () => void
    enableSoundDebug?: () => void  
    disableSoundDebug?: () => void
  }
}

// Add debug helpers to window object for easy console access
if (typeof window !== 'undefined') {
  window.toggleSoundDebug = () => {
    const currentState = soundManager.getDebugLogging()
    soundManager.setDebugLogging(!currentState)
    console.log(`Sound debug logging ${!currentState ? 'enabled' : 'disabled'}`)
  }
  
  window.enableSoundDebug = () => {
    soundManager.setDebugLogging(true)
    console.log('Sound debug logging enabled - tick sounds will now log to console')
  }
  
  window.disableSoundDebug = () => {
    soundManager.setDebugLogging(false)  
    console.log('Sound debug logging disabled - tick sounds will be silent in console')
  }
}