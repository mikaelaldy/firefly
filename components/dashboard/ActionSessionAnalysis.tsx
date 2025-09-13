'use client'

import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { TimeEstimationBreakdown } from '@/components/dashboard/TimeEstimationBreakdown'
import { ActionSessionInsights } from '@/components/dashboard/ActionSessionInsights'

interface ActionSessionAnalysisProps {
	// Action sessions as returned by /api/dashboard/stats
	actionSessions: Array<{
		editable_actions?: Array<{
			completed_at?: string
			is_custom?: boolean
			estimated_minutes?: number
		}>
		total_estimated_time?: number
		actual_time_spent?: number
		status?: string
		created_at?: string
	}>
	loading: boolean
	// Optional time estimation dataset if present
	timeEstimation?: {
		currentTask: { goal: string; estimated: number; actual: number }
		aiConfidenceLevels: Array<{ level: 'High' | 'Medium' | 'Low'; actions: number; percentage: number }>
	}
}

function Progress({ value }: { value: number }) {
	return (
		<div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}>
			<div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }}></div>
		</div>
	)
}

export function ActionSessionAnalysis({ actionSessions, loading, timeEstimation }: ActionSessionAnalysisProps) {
	// Compute high-level metrics
	const totalActions = actionSessions.reduce((total, session) => total + (session.editable_actions?.length || 0), 0)
	const completedActions = actionSessions.reduce(
		(total, session) => total + (session.editable_actions?.filter(a => a.completed_at).length || 0),
		0
	)
	const actionCompletionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

	const sessionsWithEstimates = actionSessions.filter(s => s.total_estimated_time && s.actual_time_spent)
	let timeAccuracy = 0
	if (sessionsWithEstimates.length > 0) {
		const accuracySum = sessionsWithEstimates.reduce((sum, session) => {
			const est = session.total_estimated_time || 0
			const act = session.actual_time_spent || 0
			if (est === 0) return sum
			const variance = Math.abs((act - est) / est)
			const accuracy = Math.max(0, 1 - variance)
			return sum + accuracy
		}, 0)
		timeAccuracy = Math.round((accuracySum / sessionsWithEstimates.length) * 100)
	}

	return (
		<div>
			<h3 className="text-lg font-semibold text-gray-900 mb-4">Action Session Analysis</h3>

			{/* High-level stats */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
				<div>
					<p className="text-3xl font-extrabold text-gray-900 mb-1">{actionCompletionRate}%</p>
					<p className="text-sm text-gray-600 mb-2">Action Completion</p>
					<Progress value={actionCompletionRate} />
				</div>
				<div>
					<p className="text-3xl font-extrabold text-gray-900 mb-1">{timeAccuracy}%</p>
					<p className="text-sm text-gray-600">Time Accuracy</p>
					<p className="text-xs text-gray-500 mt-1">Improving this helps you build realistic plans and reduces time anxiety!</p>
				</div>
			</div>

			{/* Details accordion */}
			<Accordion className="w-full">
				<AccordionItem title="Time Estimation Breakdown">
					<TimeEstimationBreakdown data={timeEstimation} loading={loading} />
				</AccordionItem>
				<AccordionItem title="Detailed Action Log">
					<ActionSessionInsights actionSessions={actionSessions} loading={loading} />
				</AccordionItem>
			</Accordion>
		</div>
	)
}


