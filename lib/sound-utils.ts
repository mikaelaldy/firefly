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
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private config: SoundConfig = {
    enabled: true,
    volume: 0.5,
    tickingEnabled: true,
    alarmEnabled: true,
    breakNotificationsEnabled: true
  }
  
  private tickingInterval: NodeJS.Timeout | null = null
  private audioElements: Map<SoundType, HTMLAudioElement> = new Map()

  constructor() {
    this.loadConfig()
    this.initializeAudioElements()
  }

  private loadConfig(): void {
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
    try {
      localStorage.setItem('firefly_sound_config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save sound config:', error)
    }
  }

  private initializeAudioElements(): void {
    // Create audio elements for different sound types
    const sounds: Record<SoundType, string> = {
      tick: this.generateTickSound(),
      alarm: this.generateAlarmSound(),
      'break-start': this.generateBreakStartSound(),
      'break-end': this.generateBreakEndSound()
    }

    Object.entries(sounds).forEach(([type, dataUrl]) => {
      const audio = new Audio(dataUrl)
      audio.volume = this.config.volume
      audio.preload = 'auto'
      this.audioElements.set(type as SoundType, audio)
    })
  }

  private generateTickSound(): string {
    // Generate a subtle tick sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate)
    const data = buffer.getChannelData(0)
    
    // Generate a short, subtle tick sound
    for (let i = 0; i < data.length; i++) {
      const t = i / audioContext.sampleRate
      data[i] = Math.sin(800 * 2 * Math.PI * t) * Math.exp(-t * 50) * 0.1
    }
    
    return this.bufferToDataUrl(buffer, audioContext)
  }

  private generateAlarmSound(): string {
    // Generate a pleasant but noticeable alarm sound
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
  }

  private generateBreakStartSound(): string {
    // Generate a relaxing sound for break start
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
  }

  private generateBreakEndSound(): string {
    // Generate an energizing sound for break end
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
    if (!this.config.enabled) return
    
    const shouldPlay = 
      (type === 'tick' && this.config.tickingEnabled) ||
      (type === 'alarm' && this.config.alarmEnabled) ||
      ((type === 'break-start' || type === 'break-end') && this.config.breakNotificationsEnabled)
    
    if (!shouldPlay) return
    
    const audio = this.audioElements.get(type)
    if (audio) {
      audio.currentTime = 0
      audio.volume = this.config.volume
      audio.play().catch(error => {
        console.warn(`Failed to play ${type} sound:`, error)
      })
    }
  }

  public startTicking(): void {
    if (!this.config.enabled || !this.config.tickingEnabled) return
    
    this.stopTicking() // Clear any existing interval
    
    // Play tick every second
    this.tickingInterval = setInterval(() => {
      this.playSound('tick')
    }, 1000)
  }

  public stopTicking(): void {
    if (this.tickingInterval) {
      clearInterval(this.tickingInterval)
      this.tickingInterval = null
    }
  }

  public updateConfig(newConfig: Partial<SoundConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
    
    // Update audio element volumes
    this.audioElements.forEach(audio => {
      audio.volume = this.config.volume
    })
  }

  public getConfig(): SoundConfig {
    return { ...this.config }
  }

  public async requestAudioPermission(): Promise<boolean> {
    try {
      // Try to create audio context to ensure audio is available
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }
      
      return true
    } catch (error) {
      console.warn('Audio permission denied or not available:', error)
      return false
    }
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
  
  constructor() {
    this.loadSessionCount()
  }
  
  private loadSessionCount(): void {
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
    try {
      localStorage.setItem('firefly_session_count', this.sessionCount.toString())
    } catch (error) {
      console.warn('Failed to save session count:', error)
    }
  }
  
  public completeSession(): BreakSession | null {
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
    return this.sessionCount
  }
  
  public resetSessionCount(): void {
    this.sessionCount = 0
    this.saveSessionCount()
  }
  
  public getNextBreakInfo(): { type: 'short' | 'long'; duration: number } {
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