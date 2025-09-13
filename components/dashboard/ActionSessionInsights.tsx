'use client'

interface ActionSessionInsightsProps {
  actionSessions: Array<{
    editable_actions?: Array<{
      is_custom?: boolean;
      completed_at?: string;
    }>;
    total_estimated_time?: number;
    actual_time_spent?: number;
  }>;
  loading: boolean;
}

const Progress = ({ percent }: { percent: number }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5" aria-label="progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} role="progressbar">
    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
  </div>
)

const InsightCard = ({ title, value, subtitle, icon }: { title: string, value: string, subtitle: string, icon: string }) => (
  <div className="text-center">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <p className="text-sm text-gray-600">{title}</p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

export function ActionSessionInsights({ actionSessions, loading }: ActionSessionInsightsProps) {
  if (loading) {
    return (
      <div className="animate-pulse" aria-label="Loading action insights">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (actionSessions.length === 0) {
    return (
      <div className="text-sm text-gray-700" role="status" aria-live="polite">
        No action sessions yet. Start a session to see insights.
      </div>
    );
  }

  const totalActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.length || 0), 0
  );

  const completedActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.filter(action => action.completed_at).length || 0), 0
  );

  const customActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.filter(action => action.is_custom).length || 0), 0
  );

  let averageAccuracy = 0;
  const sessionsWithEstimates = actionSessions.filter(s => s.total_estimated_time && s.actual_time_spent);
  if (sessionsWithEstimates.length > 0) {
    const accuracySum = sessionsWithEstimates.reduce((sum, session) => {
      const estimated = session.total_estimated_time || 0;
      const actual = session.actual_time_spent || 0;
      if (estimated === 0) return sum;
      return sum + Math.max(0, 1 - Math.abs((actual - estimated) / estimated));
    }, 0);
    averageAccuracy = (accuracySum / sessionsWithEstimates.length) * 100;
  }
  
  const actionCompletionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
  const customActionsPercentage = totalActions > 0 ? Math.round((customActions / totalActions) * 100) : 0;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Action Tracking Insights</h3>
      <p className="text-sm text-gray-500 mb-4">{actionSessions.length} action sessions</p>

      <div className="grid grid-cols-3 gap-4">
        <InsightCard 
          icon="✅"
          title="Actions Completed"
          value={`${completedActions}/${totalActions}`}
          subtitle={`${actionCompletionRate}% completion rate`}
        />
        <InsightCard 
          icon="✏️"
          title="Custom Actions"
          value={String(customActions)}
          subtitle={`${customActionsPercentage}% personalized`}
        />
        <InsightCard 
          icon="🎯"
          title="Time Accuracy"
          value={`${Math.round(averageAccuracy)}%`}
          subtitle="Improving this helps you build realistic plans and reduces time anxiety!"
        />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-700">Overall Completion</span>
          <span className="text-sm font-medium text-gray-900">{actionCompletionRate}%</span>
        </div>
        <Progress percent={actionCompletionRate} />
      </div>
    </div>
  );
}