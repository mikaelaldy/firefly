'use client'

interface ProgressInsightsProps {
  insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }>;
  loading: boolean;
}

const InsightCard = ({ icon, title, content, color }: { icon: string, title: string, content: string, color: 'yellow' | 'red' | 'pink' }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    pink: 'bg-pink-50 border-pink-200',
  }
  return (
    <div className={`p-4 rounded-lg flex items-start space-x-4 ${colorClasses[color]}`}>
      <div className="text-2xl mt-1">{icon}</div>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-700">{content}</p>
      </div>
    </div>
  )
}

export function ProgressInsights({ insights, loading }: ProgressInsightsProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-start space-x-4 p-4 bg-gray-100 rounded-lg">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress Insights 📊</h3>
      <div className="space-y-4">
        <InsightCard 
          icon="😊"
          title="You're building a great habit!"
          content="Each session makes the next one easier. 🚀"
          color="yellow"
        />
        <InsightCard 
          icon="💡"
          title="Short sessions are perfect for ADHD brains!"
          content="Consider the Pomodoro technique! (25min work, 5min break). 🍅"
          color="red"
        />
        <InsightCard 
          icon="🧠"
          title="ADHD Focus Tip"
          content="Your brain works differently, and that's your superpower! These insights help you understand your unique focus patterns."
          color="pink"
        />
        <div className="p-4 rounded-lg bg-gray-50 border-gray-200">
            <div className="flex items-start space-x-4">
                <div className="text-2xl mt-1">💡</div>
                <div>
                    <h4 className="font-semibold text-gray-900">Action Tracking Tips</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                        <li>Customize AI suggestions to match your workflow - personalized actions work better!</li>
                        <li>Break down large actions into smaller 5-10 minute tasks for better completion rates.</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}