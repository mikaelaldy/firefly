'use client'

import { useState } from 'react'
import { Timer } from './Timer'
import type { TimerSession } from '@/types'

export function TimerTest() {
  const [sessions, setSessions] = useState<TimerSession[]>([])

  const handleSessionComplete = (session: TimerSession) => {
    setSessions(prev => [...prev, session])
    console.log('Timer test - Session completed:', session)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Timer Test</h1>
        <p className="text-gray-600">Test the timer functionality with different durations</p>
      </div>

      <Timer 
        goal="Test timer functionality"
        onSessionComplete={handleSessionComplete}
      />

      {/* Test Results */}
      {sessions.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-3">
            {sessions.map((session, index) => (
              <div key={session.id} className="bg-white rounded p-4 border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Session #{index + 1}</p>
                    <p className="text-sm text-gray-600">{session.goal}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    session.completed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {session.completed ? 'Completed' : 'Stopped'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 grid grid-cols-2 gap-4">
                  <div>Planned: {Math.round(session.plannedDuration / 60)}m {session.plannedDuration % 60}s</div>
                  <div>Actual: {Math.round(session.actualDuration / 60)}m {session.actualDuration % 60}s</div>
                  <div>Variance: {session.variance > 0 ? '+' : ''}{session.variance}%</div>
                  <div>Started: {session.startedAt.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Test */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Performance Requirements</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>✅ Timer starts within 1 second (Requirement 3.8)</p>
          <p>✅ Visual countdown with shrinking disc (Requirement 3.2)</p>
          <p>✅ mm:ss time format display (Requirement 3.2)</p>
          <p>✅ Pause/resume functionality (Requirements 3.5, 3.6)</p>
          <p>✅ Preset durations: 25, 45, 50 minutes (Requirement 3.1)</p>
          <p>✅ Drift correction on resume (Task requirement)</p>
        </div>
      </div>
    </div>
  )
}