'use client'

interface DashboardStatsProps {
  stats: {
    totalFocusTime: number;
    averageSessionLength: number;
    completionRate: number;
    sessionsThisWeek: number;
  } | null;
  actionSessions?: Array<{
    editable_actions?: Array<{
      completed_at?: string;
    }>;
    total_estimated_time?: number;
    actual_time_spent?: number;
  }>;
  loading: boolean;
}

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: string }) => (
  <div className="text-center">
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

export function DashboardStats({ stats, actionSessions = [], loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Unable to load dashboard stats.</p>
      </div>
    );
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const totalActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.length || 0), 0
  );
  
  const completedActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.filter(action => action.completed_at).length || 0), 0
  );

  const actionSessionsWithEstimates = actionSessions.filter(session => 
    session.total_estimated_time && session.actual_time_spent
  );

  let averageAccuracy = 0;
  if (actionSessionsWithEstimates.length > 0) {
    const accuracySum = actionSessionsWithEstimates.reduce((sum, session) => {
      const estimatedMinutes = session.total_estimated_time || 0;
      const actualMinutes = session.actual_time_spent || 0;
      if (estimatedMinutes === 0) return sum;
      
      const variance = Math.abs((actualMinutes - estimatedMinutes) / estimatedMinutes);
      const accuracy = Math.max(0, 1 - variance);
      return sum + accuracy;
    }, 0);
    averageAccuracy = (accuracySum / actionSessionsWithEstimates.length) * 100;
  }

  const statCards = [
    {
      title: 'Total Focus Time',
      value: formatTime(stats.totalFocusTime),
      icon: '⏱️',
    },
    {
      title: 'Average Session',
      value: formatTime(stats.averageSessionLength),
      icon: '📊',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: '🎯',
    },
    {
      title: 'This Week',
      value: `${stats.sessionsThisWeek} sessions`,
      icon: '📅',
    },
    {
      title: 'Actions Completed',
      value: `${completedActions}/${totalActions}`,
      icon: '✅',
    },
    {
      title: 'Time Accuracy',
      value: `${Math.round(averageAccuracy)}%`,
      icon: '🎯',
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}