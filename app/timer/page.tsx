'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Timer } from '@/components'
import { Header } from '@/components/layout/Header'
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
    <>
      <Header 
        title="Focus Timer" 
        subtitle="Stay focused and track your progress"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Timer' }
        ]}
      />

      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        {/* Main Timer Interface */}
        <div className="flex flex-col items-center justify-center px-6 py-12">
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
        </div>
      </div>
    </>
  )
}

function LoadingFallback() {
  return (
    <>
      <Header 
        title="Focus Timer" 
        subtitle="Loading..."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Timer' }
        ]}
      />
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timer...</p>
        </div>
      </div>
    </>
  )
}

export default function TimerPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TimerContent />
    </Suspense>
  )
}