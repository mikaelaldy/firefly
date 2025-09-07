'use client'

interface ActionSessionInsightsProps {
  actionSessions: Array<{
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
  loading: boolean;
}

export function ActionSessionInsights({ actionSessions, loading }: ActionSessionInsightsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (actionSessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Action Tracking Insights</h3>
        <div className="text-center py-6">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-600 mb-2">No action sessions yet</p>
          <p className="text-sm text-gray-500">
            Try the enhanced next actions feature to get personalized time estimates and track your progress!
          </p>
        </div>
      </div>
    );
  }

  // Calculate insights
  const sessionsWithEstimates = actionSessions.filter(session => 
    session.total_estimated_time && session.actual_time_spent
  );

  const totalActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.length || 0), 0
  );

  const completedActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.filter(action => action.completed_at).length || 0), 0
  );

  const customActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.filter(action => action.is_custom).length || 0), 0
  );

  // Calculate time estimation accuracy
  let averageAccuracy = 0;
  if (sessionsWithEstimates.length > 0) {
    const accuracySum = sessionsWithEstimates.reduce((sum, session) => {
      const estimatedMinutes = session.total_estimated_time || 0;
      const actualMinutes = session.actual_time_spent || 0;
      if (estimatedMinutes === 0) return sum;
      
      const variance = Math.abs((actualMinutes - estimatedMinutes) / estimatedMinutes);
      const accuracy = Math.max(0, 1 - variance); // Convert to accuracy (0-1)
      return sum + accuracy;
    }, 0);
    averageAccuracy = (accuracySum / sessionsWithEstimates.length) * 100;
  }

  // Calculate confidence distribution
  const confidenceCounts = { low: 0, medium: 0, high: 0 };
  actionSessions.forEach(session => {
    session.editable_actions?.forEach(action => {
      if (action.confidence && action.estimated_minutes) {
        confidenceCounts[action.confidence]++;
      }
    });
  });

  const totalEstimatedActions = Object.values(confidenceCounts).reduce((a, b) => a + b, 0);

  const actionCompletionRate = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Action Tracking Insights</h3>
        <div className="text-sm text-gray-500">
          {actionSessions.length} action sessions
        </div>
      </div>

      <div className="space-y-6">
        {/* Action Completion Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-600">Actions Completed</span>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {completedActions}/{totalActions}
            </div>
            <div className="text-sm text-purple-600">
              {actionCompletionRate}% completion rate
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Custom Actions</span>
              <span className="text-2xl">✏️</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {customActions}
            </div>
            <div className="text-sm text-blue-600">
              {totalActions > 0 ? Math.round((customActions / totalActions) * 100) : 0}% personalized
            </div>
          </div>

          {sessionsWithEstimates.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">Time Accuracy</span>
                <span className="text-2xl">🎯</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {Math.round(averageAccuracy)}%
              </div>
              <div className="text-sm text-green-600">
                Estimation accuracy
              </div>
            </div>
          )}
        </div>

        {/* Time Estimation Insights */}
        {sessionsWithEstimates.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Time Estimation Breakdown</h4>
            <div className="space-y-2">
              {sessionsWithEstimates.slice(0, 3).map((session) => {
                const estimatedMinutes = session.total_estimated_time || 0;
                const actualMinutes = session.actual_time_spent || 0;
                const variance = estimatedMinutes > 0 
                  ? Math.round(((actualMinutes - estimatedMinutes) / estimatedMinutes) * 100)
                  : 0;
                
                const isAccurate = Math.abs(variance) <= 20; // Within 20% is considered accurate
                
                return (
                  <div key={session.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.goal}
                      </p>
                      <p className="text-xs text-gray-500">
                        Estimated: {estimatedMinutes}m • Actual: {actualMinutes}m
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      isAccurate ? 'text-green-600' : Math.abs(variance) <= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      <span className="text-xs font-medium">
                        {variance > 0 ? '+' : ''}{variance}%
                      </span>
                      <span className="text-sm">
                        {isAccurate ? '🎯' : Math.abs(variance) <= 50 ? '⚠️' : '🔄'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Confidence Distribution */}
        {totalEstimatedActions > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Confidence Levels</h4>
            <div className="space-y-2">
              {Object.entries(confidenceCounts).map(([confidence, count]) => {
                const percentage = Math.round((count / totalEstimatedActions) * 100);
                const colors = {
                  high: 'bg-green-200 text-green-800',
                  medium: 'bg-yellow-200 text-yellow-800',
                  low: 'bg-red-200 text-red-800'
                };
                
                return count > 0 ? (
                  <div key={confidence} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[confidence as keyof typeof colors]}`}>
                        {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} actions
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {percentage}%
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Helpful Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Action Tracking Tips</h4>
          <div className="space-y-1 text-sm text-blue-700">
            {averageAccuracy < 70 && sessionsWithEstimates.length >= 2 && (
              <p>• Try adding 25% buffer time to your estimates - ADHD brains often underestimate!</p>
            )}
            {customActions === 0 && totalActions > 0 && (
              <p>• Customize AI suggestions to match your workflow - personalized actions work better!</p>
            )}
            {actionCompletionRate < 60 && totalActions > 5 && (
              <p>• Break down large actions into smaller 5-10 minute tasks for better completion rates.</p>
            )}
            {actionCompletionRate >= 80 && (
              <p>• Great job! Your action completion rate shows you're building strong focus habits! 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}