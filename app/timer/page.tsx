'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Timer } from '@/components'
import type { TimerSession } from '@/types'

function TimerContent() {
  const searchParams = useSearchParams()
  const [completedSessions, setCompletedSessions] = useState<TimerSession[]>([])
  const [currentGoal, setCurrentGoal] = useState('Focus on current task')
  const [taskId, setTaskId] = useState<string | undefined>()

  // Get goal and taskId from URL params
  useEffect(() => {
    const goalParam = searchParams.get('goal')
    const taskIdParam = searchParams.get('taskId')
    
    if (goalParam) {
      setCurrentGoal(goalParam)
    }
    
    if (taskIdParam) {
      setTaskId(taskIdParam)
    }
  }, [searchParams])

  const handleSessionComplete = (session: TimerSession) => {
    setCompletedSessions(prev => [...prev, session])
    console.log('Session completed:', session)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Tasks</span>
            </a>
          </div>
          
          <h1 className="text-xl font-bold text-gray-800">
            Firefly Timer
          </h1>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Timer Interface */}
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12">
        <Timer 
          goal={currentGoal}
          taskId={taskId}
          onSessionComplete={handleSessionComplete}
        />

        {/* Session History (for testing) */}
        {completedSessions.length > 0 && (
          <div className="mt-12 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Sessions
            </h3>
            <div className="space-y-2">
              {completedSessions.slice(-3).map((session) => (
                <div 
                  key={session.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 text-sm"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{session.goal}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      session.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {session.completed ? 'Completed' : 'Stopped Early'}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    Planned: {Math.round(session.plannedDuration / 60)}m | 
                    Actual: {Math.round(session.actualDuration / 60)}m | 
                    Variance: {session.variance > 0 ? '+' : ''}{session.variance}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading timer...</p>
      </div>
    </div>
  )
}

export default function TimerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TimerContent />
    </Suspense>
  )
}