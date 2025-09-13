'use client'

interface TimeEstimationBreakdownProps {
  data?: {
    currentTask: {
      goal: string;
      estimated: number;
      actual: number;
    };
    aiConfidenceLevels: Array<{
      level: 'High' | 'Medium' | 'Low';
      actions: number;
      percentage: number;
    }>;
  };
  loading: boolean;
}

const ConfidenceBar = ({ level, actions, percentage }: { level: 'High' | 'Medium' | 'Low', actions: number, percentage: number }) => {
  const colorClasses = {
    High: {
      bg: 'bg-green-400',
      text: 'text-green-800',
      tagBg: 'bg-green-100',
    },
    Medium: {
      bg: 'bg-yellow-400',
      text: 'text-yellow-800',
      tagBg: 'bg-yellow-100',
    },
    Low: {
      bg: 'bg-red-400',
      text: 'text-red-800',
      tagBg: 'bg-red-100',
    },
  }
  
  return (
    <div className="flex items-center">
      <span className={`text-sm ${colorClasses[level].text} ${colorClasses[level].tagBg} px-2 py-0.5 rounded mr-2 w-16 text-center`}>{level}</span>
      <span className="text-sm text-gray-600 mr-2 w-20">{actions} actions</span>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${colorClasses[level].bg} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="text-sm text-gray-600 ml-2 w-10 text-right">{percentage}%</span>
    </div>
  )
}

export const TimeEstimationBreakdown = ({ data, loading }: TimeEstimationBreakdownProps) => {
    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="p-4 bg-gray-100 rounded-lg mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </div>
                </div>
                <div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

  // Using static data as per the placeholder
  const staticData = {
    currentTask: {
      goal: 'I want to finishing up my kiro hackathon where I want to add history feature, create demo script, record my demo app, submit my hackathon',
      estimated: 15,
      actual: 1,
    },
    aiConfidenceLevels: [
      { level: 'Medium', actions: 5, percentage: 60 },
      { level: 'High', actions: 4, percentage: 40 },
    ],
  } as const;
  
  const displayData = data || staticData;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Estimation Breakdown</h3>
      <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
        <p className="text-sm font-semibold text-gray-800 mb-2">Current Task</p>
        <p className="text-gray-700 mb-2 text-sm">{displayData.currentTask.goal}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Estimated: {displayData.currentTask.estimated}m</span>
          <span className="text-gray-600">Actual: {displayData.currentTask.actual}m</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-2">AI Confidence Levels</p>
        <div className="space-y-2">
          {displayData.aiConfidenceLevels.map(levelData => (
            <ConfidenceBar key={levelData.level} {...levelData} />
          ))}
        </div>
      </div>
    </div>
  );
};
