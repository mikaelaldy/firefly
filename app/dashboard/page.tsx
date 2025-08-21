'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Header } from '@/components/layout/Header'
import { Sidebar, SidebarSection } from '@/components/layout/Sidebar'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { SessionHistory } from '@/components/dashboard/SessionHistory'
import { PersonalRecords } from '@/components/dashboard/PersonalRecords'
import { ProgressInsights } from '@/components/dashboard/ProgressInsights'
import { ReadyToFocus } from '@/components/dashboard/ReadyToFocus'
import { OnboardingMessage } from '@/components/dashboard/OnboardingMessage'
import { UserSettings } from '@/components/dashboard/UserSettings'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  const fetchDashboardData = useCallback(async () => {
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
      console.log('Dashboard data received:', data)
      console.log('Recent sessions:', data.recentSessions)
      console.log('Total focus time:', data.totalFocusTime)
      setDashboardData(data)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router])

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
  }, [user, authLoading, router, fetchDashboardData])

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
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
      <>
        <Header 
          title="Dashboard" 
          subtitle="Something went wrong"
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Dashboard' }
          ]}
        />
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Oops! Something went wrong
              </h2>
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
      </>
    )
  }

  // Check if we have dashboard data (show dashboard for all authenticated users)
  const hasSessionData = !!dashboardData
  
  console.log('Dashboard render - hasSessionData:', hasSessionData)
  console.log('Dashboard render - dashboardData:', dashboardData)

  return (
    <>
      <Header 
        title="Your Focus Dashboard" 
        subtitle="Track your progress and manage your account"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' }
        ]}
      >
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'settings'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Settings
          </button>
        </div>
        
        {/* Debug: Manual refresh button - only show on overview tab */}
        {activeTab === 'overview' && (
          <button
            onClick={fetchDashboardData}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
          >
            🔄 Refresh Data
          </button>
        )}
      </Header>

      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="container mx-auto px-6">

        {activeTab === 'settings' ? (
          <UserSettings loading={loading} />
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !hasSessionData ? (
          <OnboardingMessage />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <Sidebar>
              <SidebarSection title="Ready to Focus?">
                <ReadyToFocus />
              </SidebarSection>
            </Sidebar>

            {/* Main content */}
            <div className="flex-1 space-y-8">
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

              {/* Content grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
          </div>
        )}
        </div>
      </div>
    </>
  )
}