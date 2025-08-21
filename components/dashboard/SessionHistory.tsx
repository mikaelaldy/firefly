'use client'

interface SessionHistoryProps {
  sessions: Array<{
    id: string;
    goal: string;
    plannedDuration: number; // seconds
    actualDuration: number; // seconds
    completed: boolean;
    variance: number; // percentage
    startedAt: string;
    completedAt?: string;
  }>;
  loading: boolean;
}

export function SessionHistory({ sessions, loading }: SessionHistoryProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getVarianceColor = (variance: number): string => {
    if (Math.abs(variance) <= 10) return 'text-green-600'; // Within 10% is good
    if (Math.abs(variance) <= 25) return 'text-yellow-600'; // Within 25% is okay
    return 'text-red-600'; // Over 25% needs attention
  };

  const getVarianceText = (variance: number): string => {
    if (variance === 0) return 'Perfect!';
    if (variance > 0) return `+${variance}%`;
    return `${variance}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        <div className="text-sm text-gray-500">
          Last 10 sessions
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🎯</div>
          <p className="text-gray-600 mb-2">No sessions yet</p>
          <p className="text-sm text-gray-500">
            Start your first focus session to see your history here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Status indicator */}
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                session.completed ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>

              {/* Session details */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.goal}
                </p>
                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                  <span>{formatDate(session.startedAt)}</span>
                  <span>•</span>
                  <span>
                    {formatDuration(session.actualDuration)} / {formatDuration(session.plannedDuration)}
                  </span>
                  {session.completed && (
                    <>
                      <span>•</span>
                      <span className={getVarianceColor(session.variance)}>
                        {getVarianceText(session.variance)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Session status */}
              <div className="flex-shrink-0">
                {session.completed ? (
                  <div className="flex items-center space-x-1 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Done</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Partial</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}