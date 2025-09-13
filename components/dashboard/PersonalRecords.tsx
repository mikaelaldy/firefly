'use client'

interface PersonalRecordsProps {
  records: {
    longestSession: number; // in minutes
    bestWeek: number; // total minutes
    currentStreak: number; // days
    longestStreak: number; // days
  };
  loading: boolean;
  showTitle?: boolean;
}

const RecordCard = ({ title, value, subtitle, color, icon }: { title: string, value: string, subtitle: string, color: 'yellow' | 'blue' | 'red' | 'green', icon: string }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  }

  return (
    <div className={`p-4 rounded-lg h-full ${colorClasses[color]}`}>
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

export function PersonalRecords({ records, loading, showTitle = true }: PersonalRecordsProps) {
  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Loading personal records">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-100">
            <div className="h-6 w-6 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
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
    <section aria-labelledby="records-heading">
      {showTitle && (
        <h3 id="records-heading" className="text-base font-semibold text-gray-900 mb-3">Personal Records</h3>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
        {recordItems.map((record, index) => (
          <RecordCard key={index} {...record} />
        ))}
      </div>
    </section>
  );
}