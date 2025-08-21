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

export function PersonalRecords({ records, loading }: PersonalRecordsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const recordItems = [
    {
      title: 'Longest Session',
      value: formatTime(records.longestSession),
      icon: '🏆',
      color: 'from-yellow-400 to-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Your personal best!'
    },
    {
      title: 'Best Week',
      value: formatTime(records.bestWeek),
      icon: '📈',
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      description: 'Most productive week'
    },
    {
      title: 'Current Streak',
      value: `${records.currentStreak} days`,
      icon: '🔥',
      color: 'from-red-400 to-red-500',
      bgColor: 'bg-red-50',
      description: 'Keep it going!'
    },
    {
      title: 'Longest Streak',
      value: `${records.longestStreak} days`,
      icon: '⚡',
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      description: 'Consistency champion'
    }
  ];

  const hasAnyRecords = records.longestSession > 0 || records.bestWeek > 0 || 
                       records.currentStreak > 0 || records.longestStreak > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Personal Records</h3>
        <div className="text-2xl">🏅</div>
      </div>

      {!hasAnyRecords ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-600 mb-2">No records yet</p>
          <p className="text-sm text-gray-500">
            Complete your first session to start building your achievements
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {recordItems.map((record, index) => (
            <div
              key={index}
              className={`${record.bgColor} rounded-lg p-4 text-center transition-transform duration-200 hover:scale-105`}
            >
              <div className="text-2xl mb-2">{record.icon}</div>
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">
                  {record.value}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {record.title}
                </p>
                <p className="text-xs text-gray-500">
                  {record.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivational message */}
      {hasAnyRecords && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center space-x-2">
            <div className="text-lg">✨</div>
            <p className="text-sm text-gray-700">
              {records.currentStreak > 0 
                ? `Amazing work! You're building incredible focus habits. Every session counts! 🚀`
                : `Great progress! Ready to start a new streak? Your next session is waiting! 💪`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}