'use client'
import { Button } from '@/components/ui/button'

interface SessionHistoryProps {
  sessions: Array<{
    id: string;
    goal: string;
    actualDuration: number; // seconds
    startedAt: string;
    actions?: Array<{
      id: string;
      text: string;
      completed_at?: string;
    }>;
  }>;
  loading: boolean;
}

const ActionItem = ({ text, percentage }: { text: string, percentage: number }) => (
  <div className="flex items-center space-x-2 text-sm">
    <p className="text-gray-700 truncate flex-1">{text}</p>
    <span className="text-gray-500 font-medium">{percentage}%</span>
  </div>
);

export function SessionHistory({ sessions, loading }: SessionHistoryProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-100 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return 'Today';
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  }

  // Dummy percentages for actions breakdown
  const dummyPercentages = [10, 45, 30, 0, 0];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
      <div className="space-y-4">
        {sessions.slice(0, 2).map((session, sessionIndex) => {
          const completedActions = session.actions?.filter(a => a.completed_at).length || 0;
          const totalActions = session.actions?.length || 0;

          return (
            <div key={session.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-800 truncate">{session.goal}</h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(session.startedAt)} · {formatDuration(session.actualDuration)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">Actions</Button>
                  <span className="text-xs font-medium bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Partial</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">Actions Breakdown</p>
                <p className="text-xs text-gray-500 mb-2">{completedActions} / {totalActions} completed</p>
                <div className="space-y-1">
                  {session.actions?.slice(0, 3).map((action, actionIndex) => (
                    <ActionItem key={action.id} text={action.text} percentage={dummyPercentages[actionIndex] || 0} />
                  ))}
                   {session.actions && session.actions.length > 3 && (
                    <p className="text-xs text-gray-500">+ {session.actions.length - 3} more actions</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}