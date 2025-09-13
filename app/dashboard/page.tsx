'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
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
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
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
        
        {/* Debug: Manual refresh button */}
        <button
          onClick={fetchDashboardData}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm"
        >
          🔄 Refresh Data
        </button>
      </Header>

      {activeTab === 'settings' ? (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DashboardCard>
              <UserSettings loading={loading} />
            </DashboardCard>
          </div>
        </div>
      ) : activeTab === 'history' ? (
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Detailed Stats */}
            <DashboardCard>
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
            </DashboardCard>

            {/* Personal Records */}
            <DashboardCard>
              <PersonalRecords 
                records={dashboardData?.personalRecords || {
                  longestSession: 0,
                  bestWeek: 0,
                  currentStreak: 0,
                  longestStreak: 0
                }}
                loading={loading}
              />
            </DashboardCard>

            {/* Full Session History */}
            <DashboardCard>
              <SessionHistory 
                sessions={dashboardData?.recentSessions || []}
                loading={loading}
              />
            </DashboardCard>

            {/* Action Session Insights */}
            {dashboardData?.actionSessions && dashboardData.actionSessions.length > 0 && (
              <DashboardCard>
                <ActionSessionInsights 
                  actionSessions={dashboardData.actionSessions}
                  loading={loading}
                />
              </DashboardCard>
            )}

            {/* Progress Insights */}
            <DashboardCard>
              <ProgressInsights 
                insights={dashboardData?.insights || []}
                loading={loading}
              />
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
        <div className="flex h-screen bg-gray-50">
          {/* Left Sidebar */}
          <div className="w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <div className="flex items-center space-x-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </div>
              
              <a href="/timer" className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Focus Timer</span>
              </a>
              
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Goals</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45-4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm2.55 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                </svg>
                <span>Analytics</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
              </div>
              
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm8.707 5.707a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Tasks</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Soon</span>
              </div>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg w-full text-left ${
                  activeTab === 'settings' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Settings</span>
              </button>
              
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>Help</span>
              </div>
            </nav>

            {/* Quick Stats */}
            <div className="px-4 py-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Today</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData ? Math.floor(dashboardData.totalFocusTime / 60) : 0}h
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Streak</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData?.personalRecords?.currentStreak || 0} days
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Goal</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {dashboardData?.completionRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex">
            {/* Center Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              {/* Ready to Focus Section */}
              <div className="max-w-2xl">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Focus?</h2>
                    <p className="text-gray-600">Choose how you want to start your next session</p>
                  </div>

                  {/* Start New Session Button */}
                  <div className="mb-8">
                    <ReadyToFocus />
                  </div>

                  {/* Quick Options */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 mb-4">Or choose a quick option:</p>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                            ⚡
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Quick Focus</div>
                            <div className="text-sm text-gray-500">Jump right into a 25-minute session</div>
                          </div>
                        </div>
                        <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          25 min
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            🎯
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Deep Work</div>
                            <div className="text-sm text-gray-500">Longer session for complex tasks</div>
                          </div>
                        </div>
                        <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                          50 min
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            🎨
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Custom Goal</div>
                            <div className="text-sm text-gray-500">Set your own goal and get AI guidance</div>
                          </div>
                        </div>
                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          Custom
                        </div>
                      </div>
                    </div>

                    {/* Pro Tip */}
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="text-yellow-600 mt-0.5">💡</div>
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Pro tip</div>
                          <div className="text-sm text-yellow-700">
                            Starting is the hardest part. Once you begin, your ADHD hyperfocus can be your superpower! 🚀
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* This Week Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 102 0V3h4v1a1 1 0 102 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45-4a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm2.55 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {dashboardData ? Math.floor(dashboardData.totalFocusTime / 60) : 0}h
                      </div>
                      <div className="text-sm text-gray-500">Focus Time</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {dashboardData?.sessionsThisWeek || 0}
                      </div>
                      <div className="text-sm text-gray-500">Sessions</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {dashboardData?.completionRate || 0}%
                      </div>
                      <div className="text-sm text-gray-500">Completed</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {dashboardData?.personalRecords?.currentStreak || 0}
                      </div>
                      <div className="text-sm text-gray-500">Day Streak</div>
                    </div>
                  </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All
                    </button>
                  </div>
                  
                  {!dashboardData?.recentSessions?.length ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        🎯
                      </div>
                      <p className="text-gray-600 font-medium">No sessions yet</p>
                      <p className="text-sm text-gray-500">Start your first focus session above!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.recentSessions.slice(0, 3).map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              session.completed ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {session.goal}
                              </p>
                              <p className="text-xs text-gray-500">
                                {Math.floor(session.actualDuration / 60)}m • {new Date(session.startedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {session.completed && (
                            <div className="text-green-600 text-sm">✓</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Today's Insight */}
                {dashboardData?.insights && dashboardData.insights.length > 0 && (
                  <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        ✨
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">Today&apos;s Insight</h3>
                        <p className="text-sm text-gray-600">
                          {dashboardData.insights[0]?.message || "Ready to start fresh? Even 5 minutes of focused work can build momentum! 🚀"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Personal Records */}
            <div className="w-80 bg-white border-l border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Records</h3>
                <div className="text-xl">🏆</div>
              </div>

              {!dashboardData?.personalRecords || 
               (dashboardData.personalRecords.longestSession === 0 && 
                dashboardData.personalRecords.bestWeek === 0 && 
                dashboardData.personalRecords.currentStreak === 0 && 
                dashboardData.personalRecords.longestStreak === 0) ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    🎯
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No records yet</p>
                  <p className="text-sm text-gray-500">Complete your first session to start building achievements!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="text-lg font-bold text-gray-900">
                      {Math.floor((dashboardData?.personalRecords?.longestSession || 0) / 60)}h {((dashboardData?.personalRecords?.longestSession || 0) % 60)}m
                    </div>
                    <div className="text-sm text-gray-600">Longest Session</div>
                    <div className="text-xs text-gray-500 mt-1">Your personal best</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📅</div>
                    <div className="text-lg font-bold text-gray-900">
                      {Math.floor((dashboardData?.personalRecords?.bestWeek || 0) / 60)}h
                    </div>
                    <div className="text-sm text-gray-600">Best Week</div>
                    <div className="text-xs text-gray-500 mt-1">Most productive week</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🔥</div>
                    <div className="text-lg font-bold text-gray-900">
                      {dashboardData?.personalRecords?.currentStreak || 0} days
                    </div>
                    <div className="text-sm text-gray-600">Current Streak</div>
                    <div className="text-xs text-gray-500 mt-1">Keep it going!</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-lg font-bold text-gray-900">
                      {dashboardData?.personalRecords?.longestStreak || 0} days
                    </div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                    <div className="text-xs text-gray-500 mt-1">Consistency champion</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}