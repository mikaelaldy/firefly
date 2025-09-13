'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { PersonalRecords } from '@/components/dashboard/PersonalRecords'
import { ActionSessionInsights } from '@/components/dashboard/ActionSessionInsights'
import { SessionHistory } from '@/components/dashboard/SessionHistory'
import { ProgressInsights } from '@/components/dashboard/ProgressInsights'
import { TimeEstimationBreakdown } from '@/components/dashboard/TimeEstimationBreakdown'
import { useAuth } from '@/lib/auth/context'

interface DashboardData {
	totalFocusTime: number
	averageSessionLength: number
	completionRate: number
	sessionsThisWeek: number
	personalRecords: {
		longestSession: number
		bestWeek: number
		currentStreak: number
		longestStreak: number
	}
	recentSessions: Array<any>
	actionSessions?: Array<any>
	insights: Array<{ message: string; type: 'celebration' | 'encouragement' | 'tip' }>
	timeEstimationBreakdown?: {
		currentTask: { goal: string; estimated: number; actual: number }
		aiConfidenceLevels: Array<{ level: 'High' | 'Medium' | 'Low'; actions: number; percentage: number }>
	}
}

export default function AnalyticsPage() {
	const { user } = useAuth()
	const [data, setData] = useState<DashboardData | null>(null)
	const [loading, setLoading] = useState(true)
	const fetchData = useCallback(async () => {
		try {
			setLoading(true)
			const { supabase } = await import('@/lib/supabase/client')
			const { data: sessionData } = await supabase.auth.getSession()
			const token = sessionData.session?.access_token
			if (!token) return
			const res = await fetch('/api/dashboard/stats', {
				headers: { Authorization: `Bearer ${token}` },
			})
			if (res.ok) {
				const json = await res.json()
				setData(json)
			}
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		if (user) fetchData()
	}, [user, fetchData])

	return (
		<div className="flex min-h-[calc(100vh-64px)]">
			<aside className="w-64 border-r border-gray-200 hidden md:block">
				<DashboardSidebar />
			</aside>
			<main className="flex-1 p-6 md:p-8">
				<div className="max-w-6xl mx-auto space-y-6">
					<section className="p-5 rounded-xl border border-gray-200 bg-white">
						<h2 className="text-lg font-semibold mb-6">Your Stats</h2>
						<DashboardStats
							stats={data ? {
								totalFocusTime: data.totalFocusTime,
								averageSessionLength: data.averageSessionLength,
								completionRate: data.completionRate,
								sessionsThisWeek: data.sessionsThisWeek,
							} : null}
							actionSessions={data?.actionSessions || []}
							loading={loading}
						/>
					</section>

					<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2 space-y-6">
							<div className="p-5 rounded-xl border border-gray-200 bg-white">
								<ActionSessionInsights actionSessions={data?.actionSessions || []} loading={loading} />
							</div>
							<div className="p-5 rounded-xl border border-gray-200 bg-white">
								<TimeEstimationBreakdown data={data?.timeEstimationBreakdown} loading={loading} />
							</div>
							<div className="p-5 rounded-xl border border-gray-200 bg-white">
								<ProgressInsights insights={data?.insights || []} loading={loading} />
							</div>
						</div>
						<aside className="space-y-6">
							<div className="p-5 rounded-xl border border-gray-200 bg-white">
								<PersonalRecords records={data?.personalRecords || { longestSession: 0, bestWeek: 0, currentStreak: 0, longestStreak: 0 }} loading={loading} />
							</div>
							<div className="p-5 rounded-xl border border-gray-200 bg-white">
								<SessionHistory sessions={data?.recentSessions || []} loading={loading} />
							</div>
						</aside>
					</section>
				</div>
			</main>
		</div>
	)
}


