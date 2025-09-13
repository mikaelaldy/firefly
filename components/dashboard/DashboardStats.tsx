"use client"

interface DashboardStatsProps {
  stats: {
    totalFocusTime: number;
    completionRate: number;
    currentStreak: number;
    // The following are kept for backward-compat but ignored in hero view
    averageSessionLength?: number;
    sessionsThisWeek?: number;
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
    <div className="text-5xl mb-1" aria-hidden="true">{icon}</div>
    <div className="text-4xl font-extrabold text-gray-900 tracking-tight">{value}</div>
    <div className="text-xs text-gray-600 mt-1">{title}</div>
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

  const statCards = [
    {
      title: 'Total Focus Time',
      value: formatTime(stats.totalFocusTime),
      icon: '⏱️',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: '🎯',
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: '🔥',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" aria-label="Key stats">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}