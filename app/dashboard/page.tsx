'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { SessionHistory } from '@/components/dashboard/SessionHistory'
import { PersonalRecords } from '@/components/dashboard/PersonalRecords'
import { ProgressInsights } from '@/components/dashboard/ProgressInsights'
import { QuickStart } from '@/components/dashboard/QuickStart'
import { OnboardingMessage } from '@/components/dashboard/OnboardingMessage'
import { AuthButton } from '@/components/auth/AuthButton'
import { PreferencesButton } from '@/components/PreferencesButton'

interface DashboardData {
  totalFocusTime: number;
  averageSessionLength: number;
  completionRate: number;
  sessionsThisWeek: number;
  personalRecords: {
    longestSession: number;
    bestWeek: number;
    currentStreak: number;
    longestStreak: number;
  };
  recentSessions: Array<{
    id: string;
    goal: string;
    plannedDuration: number;
    actualDuration: number;
    completed: boolean;
    variance: number;
    startedAt: string;
    completedAt?: string;
  }>;
  insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }>;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to home if not authenticated after auth loads
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    // Fetch dashboard data if user is authenticated
    if (user && !authLoading) {
      fetchDashboardData()
    }
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the session token from the client-side Supabase client
      const { supabase } = await import('@/lib/supabase/client')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found, redirecting to home')
        router.push('/')
        return
      }

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('API returned 401, redirecting to home')
          router.push('/')
          return
        }
        throw new Error(`Failed to fetch dashboard data: ${response.status}`)
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Redirect if not authenticated (this should be handled by useEffect, but just in case)
  if (!user) {
    return null
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Top navigation */}
        <div className="fixed top-6 right-6 z-50 flex items-center space-x-2">
          <PreferencesButton />
          <AuthButton />
        </div>

        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if user has any session data
  const hasSessionData = dashboardData && (
    dashboardData.recentSessions.length > 0 || 
    dashboardData.totalFocusTime > 0
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Top navigation */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-2">
        <PreferencesButton />
        <AuthButton />
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Your Focus Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Track your progress and celebrate your wins! 🎉
          </p>
        </div>

        {/* Show onboarding message if no session data */}
        {!hasSessionData && !loading ? (
          <OnboardingMessage />
        ) : (
          <div className="space-y-8">
            {/* Quick Start Section */}
            <div className="max-w-2xl mx-auto">
              <QuickStart />
            </div>

            {/* Stats Overview */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Stats</h2>
              <DashboardStats 
                stats={dashboardData ? {
                  totalFocusTime: dashboardData.totalFocusTime,
                  averageSessionLength: dashboardData.averageSessionLength,
                  completionRate: dashboardData.completionRate,
                  sessionsThisWeek: dashboardData.sessionsThisWeek
                } : null}
                loading={loading}
              />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-8">
                <PersonalRecords 
                  records={dashboardData?.personalRecords || {
                    longestSession: 0,
                    bestWeek: 0,
                    currentStreak: 0,
                    longestStreak: 0
                  }}
                  loading={loading}
                />
                
                <ProgressInsights 
                  insights={dashboardData?.insights || []}
                  loading={loading}
                />
              </div>

              {/* Right column */}
              <div>
                <SessionHistory 
                  sessions={dashboardData?.recentSessions || []}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}