'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SessionHistory } from '@/components/dashboard/SessionHistory'
import { useAuth } from '@/lib/auth/context'

interface SessionData {
  id: string;
  goal: string;
  actualDuration: number;
  startedAt: string;
  actions?: Array<{
    id: string;
    text: string;
    completed_at?: string;
  }>;
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSessions() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${(await user.getSession())?.access_token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setSessions(data.recentSessions || [])
        }
      } catch (error) {
        console.error('Error fetching session history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [user])

  return (
    <DashboardLayout sidebar={<DashboardSidebar />}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Session History</h1>
          
          {/* Limitation Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Recent Sessions Only
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>
                    We're currently storing your most recent sessions to keep the app fast and efficient. 
                    This helps us maintain optimal performance while you focus on what matters most.
                  </p>
                  <p className="mt-2 font-medium">
                    🚀 Coming Soon: Unlimited session history will be available in a future update!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session History */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <SessionHistory sessions={sessions} loading={loading} />
          
          {!loading && sessions.length === 0 && user && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions yet</h3>
              <p className="mt-1 text-sm text-gray-500">Start your first focus session to see your history here.</p>
              <div className="mt-6">
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Start First Session
                </a>
              </div>
            </div>
          )}

          {!user && (
            <div className="text-center py-12">
              <h3 className="text-sm font-medium text-gray-900">Sign in to view your session history</h3>
              <p className="mt-1 text-sm text-gray-500">Your session history is saved when you're logged in.</p>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Have Feedback?</h3>
          <p className="text-sm text-gray-600 mb-4">
            We'd love to hear your thoughts on Firefly and ideas for improvement!
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a href="mailto:mikascend@gmail.com" className="text-blue-600 hover:text-blue-800">
                mikascend@gmail.com
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
              <a href="https://x.com/mikascend" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                @mikascend
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <a href="https://github.com/mikaelaldy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                github.com/mikaelaldy
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
