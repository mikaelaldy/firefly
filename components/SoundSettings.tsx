'use client'

import { useState, useEffect } from 'react'
import { soundManager } from '@/lib/sound-utils'

interface SoundSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const [config, setConfig] = useState(soundManager.getConfig())
  const [audioPermission, setAudioPermission] = useState<boolean | null>(null)

  useEffect(() => {
    if (isOpen) {
      setConfig(soundManager.getConfig())
      checkAudioPermission()
    }
  }, [isOpen])

  const checkAudioPermission = async () => {
    const hasPermission = await soundManager.requestAudioPermission()
    setAudioPermission(hasPermission)
  }

  const updateConfig = (updates: Partial<typeof config>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    soundManager.updateConfig(updates)
  }

  const testSound = async (type: 'tick' | 'alarm' | 'break-start' | 'break-end') => {
    console.log(`Testing sound: ${type}`)
    
    // First try to enable audio with user gesture
    const audioEnabled = await soundManager.enableAudioWithUserGesture()
    console.log('Audio enabled:', audioEnabled)
    
    // Then play the sound
    soundManager.playSound(type)
  }

  const testTicking = async () => {
    console.log('Testing continuous ticking...')
    
    // Enable audio first
    const audioEnabled = await soundManager.enableAudioWithUserGesture()
    if (audioEnabled) {
      soundManager.testTicking()
    } else {
      console.warn('Could not enable audio for ticking test')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Sound Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {audioPermission === false && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">Audio Permission Required</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Click anywhere to enable audio, then adjust settings below.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Master Enable */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Enable Sounds</label>
              <p className="text-xs text-gray-500">Master control for all audio</p>
            </div>
            <button
              onClick={() => updateConfig({ enabled: !config.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Volume</label>
            <div className="flex items-center space-x-3">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.volume}
                onChange={(e) => updateConfig({ volume: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                disabled={!config.enabled}
              />
              <span className="text-sm text-gray-600 w-8">
                {Math.round(config.volume * 100)}%
              </span>
            </div>
          </div>

          {/* Individual Sound Controls */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Sound Types</h4>
            
            {/* Timer Ticking */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Timer Ticking</label>
                  <button
                    onClick={() => testSound('tick')}
                    disabled={!config.enabled || !config.tickingEnabled}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  >
                    Test
                  </button>
                </div>
                <p className="text-xs text-gray-500">Subtle tick every second during focus</p>
              </div>
              <button
                onClick={() => updateConfig({ tickingEnabled: !config.tickingEnabled })}
                disabled={!config.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  config.tickingEnabled && config.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    config.tickingEnabled && config.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Session Complete Alarm */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Session Complete</label>
                  <button
                    onClick={() => testSound('alarm')}
                    disabled={!config.enabled || !config.alarmEnabled}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  >
                    Test
                  </button>
                </div>
                <p className="text-xs text-gray-500">Alert when timer finishes</p>
              </div>
              <button
                onClick={() => updateConfig({ alarmEnabled: !config.alarmEnabled })}
                disabled={!config.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  config.alarmEnabled && config.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    config.alarmEnabled && config.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Break Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Break Notifications</label>
                  <button
                    onClick={() => testSound('break-start')}
                    disabled={!config.enabled || !config.breakNotificationsEnabled}
                    className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  >
                    Test
                  </button>
                </div>
                <p className="text-xs text-gray-500">Sounds for break start and end</p>
              </div>
              <button
                onClick={() => updateConfig({ breakNotificationsEnabled: !config.breakNotificationsEnabled })}
                disabled={!config.enabled}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  config.breakNotificationsEnabled && config.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    config.breakNotificationsEnabled && config.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Debug Logging (for development) */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Debug Logging</label>
                <span className="text-xs text-gray-400">(Development)</span>
              </div>
              <p className="text-xs text-gray-500">Show detailed sound logs in console</p>
            </div>
            <button
              onClick={() => updateConfig({ debugLogging: !config.debugLogging })}
              disabled={!config.enabled}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                config.debugLogging && config.enabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  config.debugLogging && config.enabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* ADHD-Friendly Note */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm text-purple-800 font-medium">ADHD-Friendly Audio</p>
                <p className="text-xs text-purple-700 mt-1">
                  Sounds are designed to be helpful without being distracting. Ticking can help with time awareness, but disable it if it&apos;s too stimulating.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}