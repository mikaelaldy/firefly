'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionResults } from '@/components/SessionResults'
import type { TimerSession } from '@/types'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<TimerSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get session data from URL params or localStorage
    const sessionId = searchParams.get('session')
    
    if (sessionId) {
      // Try to get session from localStorage first
      const storedSession = localStorage.getItem(`session_${sessionId}`)
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession)
          // Convert date strings back to Date objects
          parsedSession.startedAt = new Date(parsedSession.startedAt)
          if (parsedSession.completedAt) {
            parsedSession.completedAt = new Date(parsedSession.completedAt)
          }
          setSession(parsedSession)
        } catch (error) {
          console.error('Error parsing session data:', error)
          router.push('/')
          return
        }
      } else {
        // Session not found, redirect to home
        router.push('/')
        return
      }
    } else {
      // No session ID, redirect to home
      router.push('/')
      return
    }
    
    setLoading(false)
  }, [searchParams, router])

  const handleContinue = () => {
    // Continue with the same task - go back to timer with the same goal
    if (session) {
      const params = new URLSearchParams({
        goal: session.goal,
        continue: 'true'
      })
      router.push(`/timer?${params.toString()}`)
    }
  }

  const handleNewTask = () => {
    // Start fresh - go back to home page
    router.push('/')
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent default behavior for our shortcuts
      if (event.key === 'Enter' || event.key.toLowerCase() === 'n') {
        event.preventDefault()
      }
      
      if (event.key === 'Enter') {
        handleContinue()
      } else if (event.key.toLowerCase() === 'n') {
        handleNewTask()
      }
    }

    // Ensure the page can receive keyboard events
    document.body.focus()
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [session, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session results...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Session Not Found</h1>
          <p className="text-gray-600 mb-6">The session results could not be loaded.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Home</span>
            </button>
          </div>
          
          <h1 className="text-xl font-bold text-gray-800">
            Session Complete
          </h1>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12">
        <SessionResults
          session={session}
          onContinue={handleContinue}
          onNewTask={handleNewTask}
        />
      </main>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading session results...</p>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsContent />
    </Suspense>
  )
}