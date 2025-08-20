'use client'

import { useState } from 'react'
import { usePreferences } from '@/lib/preferences/context'

interface PreferencesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function PreferencesPanel({ isOpen, onClose }: PreferencesPanelProps) {
  const { preferences, updatePreferences, toggleHighContrast, toggleReducedMotion } = usePreferences()

  if (!isOpen) return null

  const handleTimerDurationChange = (duration: 25 | 45 | 50) => {
    updatePreferences({ defaultTimerDuration: duration })
  }

  const handleSoundToggle = (soundType: 'soundEnabled' | 'tickSoundEnabled') => {
    updatePreferences({ [soundType]: !preferences[soundType] })
  }

  const handleBufferChange = (buffer: number) => {
    updatePreferences({ bufferPercentage: buffer })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="preferences-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="preferences-title" className="text-xl font-semibold text-gray-900">
            Preferences
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            aria-label="Close preferences"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Accessibility Section */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility</h3>
            <div className="space-y-4">
              
              {/* High Contrast Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                    High Contrast Mode
                  </label>
                  <p className="text-xs text-gray-500">Increases color contrast for better visibility</p>
                </div>
                <button
                  id="high-contrast"
                  onClick={toggleHighContrast}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.highContrastMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={preferences.highContrastMode}
                  aria-labelledby="high-contrast"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.highContrastMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
                    Reduce Motion
                  </label>
                  <p className="text-xs text-gray-500">Minimizes animations and transitions</p>
                </div>
                <button
                  id="reduced-motion"
                  onClick={toggleReducedMotion}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    preferences.reducedMotion ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={preferences.reducedMotion}
                  aria-labelledby="reduced-motion"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Timer Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timer Settings</h3>
            <div className="space-y-4">
              
              {/* Default Duration */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Default Timer Duration
                </label>
                <div className="flex space-x-2">
                  {[25, 45, 50].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => handleTimerDurationChange(duration as 25 | 45 | 50)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        preferences.defaultTimerDuration === duration
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="sound-enabled" className="text-sm font-medium text-gray-700">
                      Timer Sounds
                    </label>
                    <p className="text-xs text-gray-500">Play sounds when timer starts/stops</p>
                  </div>
                  <button
                    id="sound-enabled"
                    onClick={() => handleSoundToggle('soundEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preferences.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={preferences.soundEnabled}
                    aria-labelledby="sound-enabled"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="tick-sound" className="text-sm font-medium text-gray-700">
                      Tick Sound
                    </label>
                    <p className="text-xs text-gray-500">Soft ticking during timer</p>
                  </div>
                  <button
                    id="tick-sound"
                    onClick={() => handleSoundToggle('tickSoundEnabled')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      preferences.tickSoundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={preferences.tickSoundEnabled}
                    aria-labelledby="tick-sound"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.tickSoundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Buffer Settings */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Time Management</h3>
            <div>
              <label htmlFor="buffer-percentage" className="text-sm font-medium text-gray-700 block mb-2">
                Default Buffer Percentage: {preferences.bufferPercentage}%
              </label>
              <input
                id="buffer-percentage"
                type="range"
                min="0"
                max="50"
                step="5"
                value={preferences.bufferPercentage}
                onChange={(e) => handleBufferChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Extra time added to estimates for better planning
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}