'use client'

import { useRouter } from 'next/navigation'

export function OnboardingMessage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/')
  }

  const tips = [
    {
      icon: '🎯',
      title: 'Start Small',
      description: 'Begin with 10-15 minute sessions to build confidence and momentum'
    },
    {
      icon: '⚡',
      title: 'Use AI Guidance',
      description: 'Let Firefly break down your goals into 60-second micro-tasks'
    },
    {
      icon: '🔥',
      title: 'Build Streaks',
      description: 'Consistency beats perfection - even 5 minutes counts!'
    },
    {
      icon: '🧠',
      title: 'ADHD-Friendly',
      description: 'Designed specifically for ADHD brains with minimal distractions'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to Firefly!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You're about to transform how you approach tasks. Firefly is designed specifically for ADHD brains to overcome task paralysis and build focus habits.
        </p>
      </div>

      {/* Tips grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl flex-shrink-0">{tip.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {tip.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Getting started section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-8 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Ready to Start Your First Session?
        </h3>
        <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
          The hardest part is starting. Once you begin, you'll discover how powerful focused work can be for your ADHD brain.
        </p>
        
        <button
          onClick={handleGetStarted}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Start Your First Session</span>
          </div>
        </button>
      </div>

      {/* ADHD-specific encouragement */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">💚</div>
          <div>
            <h4 className="text-lg font-semibold text-green-800 mb-2">
              A Message for ADHD Brains
            </h4>
            <p className="text-green-700 text-sm leading-relaxed">
              Your brain works differently, and that's not a bug—it's a feature! ADHD brains can achieve incredible focus when given the right structure and support. Firefly provides that structure without overwhelming you. Remember: progress over perfection, and every small step counts. You've got this! 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}