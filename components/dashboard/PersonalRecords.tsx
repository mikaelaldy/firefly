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
    yellow: 'bg-yellow-50 border-yellow-200 border shadow-sm',
    blue: 'bg-blue-50 border-blue-200 border shadow-sm',
    red: 'bg-orange-50 border-orange-200 border shadow-sm',
    green: 'bg-green-50 border-green-200 border shadow-sm',
  }

  return (
    <div className={`p-4 rounded-lg h-full ${colorClasses[color]} flex flex-col justify-center min-h-[120px]`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
          <div className="text-sm font-medium text-gray-800 mt-1">{title}</div>
          <div className="text-xs text-gray-600 mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

export function PersonalRecords({ records, loading, showTitle = true }: PersonalRecordsProps) {
  if (loading) {
    return (
      <div className="animate-pulse grid grid-cols-2 gap-4" aria-label="Loading personal records">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-gray-100 min-h-[120px] flex items-center">
            <div className="flex items-start space-x-3 w-full">
              <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
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
      color: 'green',
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
      color: 'blue',
    }
  ] as const;

  return (
    <section aria-labelledby="records-heading">
      {showTitle && (
        <h3 id="records-heading" className="text-base font-semibold text-gray-900 mb-3">Personal Records</h3>
      )}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        {recordItems.map((record, index) => (
          <RecordCard key={index} {...record} />
        ))}
      </div>
    </section>
  );
}