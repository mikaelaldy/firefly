'use client'

interface ProgressInsightsProps {
  insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }>;
  loading: boolean;
}

export function ProgressInsights({ insights, loading }: ProgressInsightsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'celebration':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          icon: '🎉'
        };
      case 'encouragement':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          icon: '💪'
        };
      case 'tip':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: '💡'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          icon: '✨'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Your Progress Insights</h3>
        <div className="text-2xl">🧠</div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-600 mb-2">Building insights...</p>
          <p className="text-sm text-gray-500">
            Complete a few sessions to get personalized insights about your focus patterns
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const style = getInsightStyle(insight.type);
            return (
              <div
                key={index}
                className={`${style.bgColor} ${style.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-sm`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-xl flex-shrink-0 mt-0.5">
                    {style.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`${style.textColor} text-sm leading-relaxed`}>
                      {insight.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADHD-friendly encouragement */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
        <div className="flex items-center space-x-2">
          <div className="text-lg">🧠</div>
          <div className="flex-1">
            <p className="text-sm text-purple-800 font-medium mb-1">
              ADHD Focus Tip
            </p>
            <p className="text-xs text-purple-700">
              Your brain works differently, and that&apos;s your superpower! These insights help you understand your unique focus patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}