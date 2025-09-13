'use client'

interface PersonalRecordsProps {
  records: {
    longestSession: number; // in minutes
    bestWeek: number; // total minutes
    currentStreak: number; // days
    longestStreak: number; // days
  };
  loading: boolean;
}

const RecordCard = ({ title, value, subtitle, color, icon }: { title: string, value: string, subtitle: string, color: 'yellow' | 'blue' | 'red' | 'green', icon: string }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  }

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="flex items-center space-x-4">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
          <div className="text-sm font-medium text-gray-800">{title}</div>
          <div className="text-xs text-gray-600">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

export function PersonalRecords({ records, loading }: PersonalRecordsProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="h-16 bg-gray-100 rounded-lg mt-4"></div>
      </div>
    );
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const recordItems = [
    {
      title: 'Longest Session',
      value: formatTime(records.longestSession),
      subtitle: 'Your personal best',
      icon: '🏆',
      color: 'yellow',
    },
    {
      title: 'Best Week',
      value: formatTime(records.bestWeek),
      subtitle: 'Most productive week',
      icon: '🗓️',
      color: 'blue',
    },
    {
      title: 'Current Streak',
      value: `${records.currentStreak} days`,
      subtitle: 'Keep it going!',
      icon: '🔥',
      color: 'red',
    },
    {
      title: 'Longest Streak',
      value: `${records.longestStreak} days`,
      subtitle: 'Consistency champion',
      icon: '⚡',
      color: 'green',
    }
  ] as const;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Records 🏆</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recordItems.map((record, index) => (
          <RecordCard key={index} {...record} />
        ))}
      </div>
      <div className="mt-4 p-4 rounded-lg bg-blue-50 border-blue-200 flex items-center space-x-3">
        <div className="text-2xl">🎉</div>
        <p className="text-sm text-gray-800">Amazing work! You&apos;re building incredible focus habits. Every session counts! 🚀</p>
      </div>
    </div>
  );
}