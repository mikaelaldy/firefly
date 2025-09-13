'use client'

import { useCallback, useEffect, useState } from 'react'
import { DashboardLayout, DashboardSection, DashboardGrid, DashboardCard } from '@/components/dashboard/DashboardLayout'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { PersonalRecords } from '@/components/dashboard/PersonalRecords'
import { ActionSessionAnalysis } from '@/components/dashboard/ActionSessionAnalysis'
import { SessionHistory } from '@/components/dashboard/SessionHistory'
import { ProgressInsights } from '@/components/dashboard/ProgressInsights'
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
		<DashboardLayout sidebar={<DashboardSidebar />}>
			<DashboardSection id="analytics" title="Your Progress Analytics" subtitle="Review your stats and discover patterns to improve your focus.">
				<DashboardGrid columns={2}>
					<DashboardCard className="md:col-span-2">
						<h3 className="text-lg font-medium mb-4">Quick Stats</h3>
						<DashboardStats
							stats={data ? {
								totalFocusTime: data.totalFocusTime,
								completionRate: data.completionRate,
								currentStreak: data.personalRecords?.currentStreak || 0,
							} : null}
							actionSessions={data?.actionSessions || []}
							loading={loading}
						/>
					</DashboardCard>

					<DashboardCard>
						<PersonalRecords records={data?.personalRecords || { longestSession: 0, bestWeek: 0, currentStreak: 0, longestStreak: 0 }} loading={loading} />
					</DashboardCard>

					<DashboardCard className="md:col-span-2">
						<ActionSessionAnalysis actionSessions={data?.actionSessions || []} loading={loading} timeEstimation={data?.timeEstimationBreakdown} />
					</DashboardCard>

					<DashboardCard className="md:col-span-2">
						<Accordion className="w-full">
							<AccordionItem title="Progress Insights">
								<ProgressInsights insights={data?.insights || []} loading={loading} />
							</AccordionItem>
							<AccordionItem title="Session History">
								<SessionHistory sessions={data?.recentSessions || []} loading={loading} />
							</AccordionItem>
						</Accordion>
					</DashboardCard>
				</DashboardGrid>
			</DashboardSection>
		</DashboardLayout>
	)
}


