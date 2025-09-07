'use client'

import { useState } from 'react'
import { soundManager, breakManager, formatBreakMessage, getBreakSuggestions } from '@/lib/sound-utils'
import { SoundSettings } from '@/components/SoundSettings'

export default function SoundDemoPage() {
  const [showSoundSettings, setShowSoundSettings] = useState(false)
  const [sessionCount, setSessionCount] = useState(breakManager.getSessionCount())
  const [currentBreak, setCurrentBreak] = useState<any>(null)

  const playTestSound = (type: 'tick' | 'alarm' | 'break-start' | 'break-end') => {
    soundManager.playSound(type)
  }

  const startTicking = () => {
    soundManager.startTicking()
  }

  const stopTicking = () => {
    soundManager.stopTicking()
  }

  const completeSession = () => {
    const breakSession = breakManager.completeSession()
    setSessionCount(breakManager.getSessionCount())
    setCurrentBreak(breakSession)
    
    if (breakSession) {
      soundManager.playSound('alarm')
    }
  }

  const resetSessions = () => {
    breakManager.resetSessionCount()
    setSessionCount(0)
    setCurrentBreak(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Sound Features Demo</h1>
            <button
              onClick={() => setShowSoundSettings(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sound Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sound Testing */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Sound Testing</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Individual Sounds</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => playTestSound('tick')}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      🔊 Tick
                    </button>
                    <button
                      onClick={() => playTestSound('alarm')}
                      className="px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300 transition-colors"
                    >
                      🔔 Alarm
                    </button>
                    <button
                      onClick={() => playTestSound('break-start')}
                      className="px-3 py-2 bg-blue-200 text-blue-700 rounded hover:bg-blue-300 transition-colors"
                    >
                      🎵 Break Start
                    </button>
                    <button
                      onClick={() => playTestSound('break-end')}
                      className="px-3 py-2 bg-green-200 text-green-700 rounded hover:bg-green-300 transition-colors"
                    >
                      ⚡ Break End
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Timer Ticking</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={startTicking}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      ▶️ Start Ticking
                    </button>
                    <button
                      onClick={stopTicking}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      ⏹️ Stop Ticking
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Break Management */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Break Management</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Session Progress</h3>
                    <p className="text-sm text-gray-600">Completed Sessions: {sessionCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Next Break:</p>
                    <p className="font-medium text-gray-800">
                      {breakManager.getNextBreakInfo().duration}min {breakManager.getNextBreakInfo().type}
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={completeSession}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Complete Session
                  </button>
                  <button
                    onClick={resetSessions}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Reset Count
                  </button>
                </div>
              </div>

              {/* Current Break Display */}
              {currentBreak && (
                <div className={`rounded-lg p-4 border-2 ${
                  currentBreak.type === 'long' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <h3 className="text-lg font-medium mb-2">
                    {currentBreak.type === 'long' ? '🎉 Long Break!' : '✨ Short Break!'}
                  </h3>
                  <p className="text-sm mb-3">{formatBreakMessage(currentBreak)}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Suggestions:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {getBreakSuggestions(currentBreak.type).slice(0, 3).map((suggestion, index) => (
                        <div key={index} className="text-xs bg-white rounded px-2 py-1 border">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCurrentBreak(null)}
                    className="mt-3 px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Feature Overview */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sound Features Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">🔊 Timer Ticking</h3>
                <p className="text-sm text-purple-700">
                  Subtle tick sound every second during focus sessions to help with time awareness.
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">🔔 Session Alarms</h3>
                <p className="text-sm text-red-700">
                  Pleasant alarm sound when timer completes to signal the end of focus sessions.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">⏰ Smart Breaks</h3>
                <p className="text-sm text-blue-700">
                  Automatic 5-minute breaks after each session, 15-minute breaks after every 4th session.
                </p>
              </div>
            </div>
          </div>

          {/* ADHD-Friendly Notes */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 ADHD-Friendly Design</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• All sounds can be individually disabled if they become distracting</li>
              <li>• Volume is adjustable to find the right level for your sensitivity</li>
              <li>• Break suggestions help with transition difficulties</li>
              <li>• Automatic break timing follows proven productivity patterns</li>
            </ul>
          </div>
        </div>
      </div>

      <SoundSettings 
        isOpen={showSoundSettings} 
        onClose={() => setShowSoundSettings(false)} 
      />
    </div>
  )
}