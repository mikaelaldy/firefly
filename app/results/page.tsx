'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SessionResults } from '@/components/SessionResults'
import { Header } from '@/components/layout/Header'
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

  const handleContinue = useCallback(() => {
    // Continue with the same task - go back to timer with the same goal
    if (session) {
      const params = new URLSearchParams({
        goal: session.goal,
        continue: 'true'
      })
      router.push(`/timer?${params.toString()}`)
    }
  }, [session, router])

  const handleNewTask = useCallback(() => {
    // Start fresh - go back to home page
    router.push('/')
  }, [router])

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
  }, [session, router, handleContinue, handleNewTask])

  if (loading) {
    return (
      <>
        <Header 
          title="Session Results" 
          subtitle="Loading..."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Results' }
          ]}
        />
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading session results...</p>
          </div>
        </div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <Header 
          title="Session Results" 
          subtitle="Session not found"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Results' }
          ]}
        />
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Not Found</h2>
            <p className="text-gray-600 mb-6">The session results could not be loaded.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header 
        title="Session Complete" 
        subtitle="Great work! Here's how you did"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Timer', href: '/timer' },
          { label: 'Results' }
        ]}
      />

      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        {/* Main Content */}
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <SessionResults
            session={session}
            onContinue={handleContinue}
            onNewTask={handleNewTask}
          />
        </div>
      </div>
    </>
  )
}

function LoadingFallback() {
  return (
    <>
      <Header 
        title="Session Results" 
        subtitle="Loading..."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Results' }
        ]}
      />
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session results...</p>
        </div>
      </div>
    </>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultsContent />
    </Suspense>
  )
}