'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Header } from '@/components/layout/Header'
import { DashboardLayout, DashboardSection, DashboardGrid, DashboardCard } from '@/components/dashboard/DashboardLayout'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { SessionHistory } from '@/components/dashboard/SessionHistory'
import { PersonalRecords } from '@/components/dashboard/PersonalRecords'
import { ProgressInsights } from '@/components/dashboard/ProgressInsights'
import { ReadyToFocus } from '@/components/dashboard/ReadyToFocus'
import { OnboardingMessage } from '@/components/dashboard/OnboardingMessage'
import { UserSettings } from '@/components/dashboard/UserSettings'
import { ActionSessionInsights } from '@/components/dashboard/ActionSessionInsights'
import { AuthStatus } from '@/components/AuthStatus'

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
    type?: 'regular' | 'action';
    actions?: Array<{
      id: string;
      text: string;
      estimated_minutes?: number;
      confidence?: 'low' | 'medium' | 'high';
      is_custom?: boolean;
      order_index: number;
      completed_at?: string;
      created_at: string;
    }>;
  }>;
  insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }>;
  actionSessions?: Array<{
    id: string;
    goal: string;
    total_estimated_time?: number;
    actual_time_spent?: number;
    status: string;
    created_at: string;
    editable_actions?: Array<{
      id: string;
      text: string;
      estimated_minutes?: number;
      confidence?: 'low' | 'medium' | 'high';
      is_custom?: boolean;
      completed_at?: string;
    }>;
  }>;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview')

  // Debug logging
  useEffect(() => {
    console.log('Dashboard: Auth state changed', { user: !!user, authLoading, userEmail: user?.email })
  }, [user, authLoading])

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
    // Give more time for auth to load, especially after OAuth callback
    const redirectTimer = setTimeout(() => {
      if (!authLoading && !user) {
        console.log('Dashboard: No user found after auth loaded, redirecting to home')
        router.push('/')
        return
      }
    }, 1000) // Wait 1 second before redirecting

    // Fetch dashboard data if user is authenticated
    if (user && !authLoading) {
      clearTimeout(redirectTimer)
      fetchDashboardData()
    }

    return () => clearTimeout(redirectTimer)
  }, [user, authLoading, router, fetchDashboardData])

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <div className="mt-4">
            <AuthStatus />
          </div>
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

      {activeTab === 'settings' ? (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DashboardCard>
              <UserSettings loading={loading} />
            </DashboardCard>
          </div>
        </div>
      ) : loading ? (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      ) : !hasSessionData ? (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <OnboardingMessage />
          </div>
        </div>
      ) : (
        <DashboardLayout sidebar={<DashboardSidebar />}>
          {/* Overview Section */}
          <DashboardSection 
            id="overview" 
            title="Dashboard Overview"
            subtitle="Get a quick overview of your focus journey"
          >
            <DashboardCard>
              <ReadyToFocus />
            </DashboardCard>
          </DashboardSection>

          {/* Stats Section */}
          <DashboardSection 
            id="stats" 
            title="Your Stats"
            subtitle="Track your focus metrics and progress"
          >
            <DashboardStats 
              stats={dashboardData ? {
                totalFocusTime: dashboardData.totalFocusTime,
                averageSessionLength: dashboardData.averageSessionLength,
                completionRate: dashboardData.completionRate,
                sessionsThisWeek: dashboardData.sessionsThisWeek
              } : null}
              actionSessions={dashboardData?.actionSessions || []}
              loading={loading}
            />
          </DashboardSection>

          {/* Action Session Insights */}
          <DashboardSection 
            id="actions" 
            title="Action Sessions"
            subtitle="AI-powered task breakdown and execution tracking"
          >
            <ActionSessionInsights 
              actionSessions={dashboardData?.actionSessions || []}
              loading={loading}
            />
          </DashboardSection>

          {/* Records and Insights Grid */}
          <DashboardGrid columns={2}>
            <div>
              <DashboardSection 
                id="records" 
                title="Personal Records"
                subtitle="Your best achievements"
              >
                <PersonalRecords 
                  records={dashboardData?.personalRecords || {
                    longestSession: 0,
                    bestWeek: 0,
                    currentStreak: 0,
                    longestStreak: 0
                  }}
                  loading={loading}
                />
              </DashboardSection>
            </div>

            <div>
              <DashboardSection 
                id="insights" 
                title="Progress Insights"
                subtitle="Personalized tips and encouragement"
              >
                <ProgressInsights 
                  insights={dashboardData?.insights || []}
                  loading={loading}
                />
              </DashboardSection>
            </div>
          </DashboardGrid>

          {/* Session History */}
          <DashboardSection 
            id="sessions" 
            title="Session History"
            subtitle="Review your recent focus sessions"
          >
            <SessionHistory 
              sessions={dashboardData?.recentSessions || []}
              loading={loading}
            />
          </DashboardSection>
        </DashboardLayout>
      )}
    </>
  )
}