'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ReadyToFocus() {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleStartNewSession = () => {
    setIsStarting(true)
    // Navigate to the main page where users can input their goal
    router.push('/')
  }

  const quickStartOptions = [
    {
      title: 'Quick Focus',
      description: 'Jump right into a 25-minute session',
      duration: '25 min',
      icon: '⚡',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      action: () => {
        // Navigate directly to timer with default settings
        router.push('/timer?duration=25&goal=Quick focus session')
      }
    },
    {
      title: 'Deep Work',
      description: 'Longer session for complex tasks',
      duration: '50 min',
      icon: '🎯',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      action: () => {
        router.push('/timer?duration=50&goal=Deep work session')
      }
    },
    {
      title: 'Custom Goal',
      description: 'Set your own goal and get AI guidance',
      duration: 'Custom',
      icon: '✨',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      action: handleStartNewSession
    }
  ]

  return (
    <div className="space-y-6">
      {/* Ready to Focus Section */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Ready to Focus?
        </h3>
        <p className="text-gray-600 text-sm">
          Choose how you want to start your next session
        </p>
      </div>

      {/* Primary CTA */}
      <button
        onClick={handleStartNewSession}
        disabled={isStarting}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
      >
        <div className="flex items-center justify-center space-x-2">
          {isStarting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Starting...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Start New Session</span>
            </>
          )}
        </div>
      </button>

      {/* Quick options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 text-center">
          Or choose a quick option:
        </p>
        
        <div className="space-y-2">
          {quickStartOptions.map((option, index) => (
            <button
              key={index}
              onClick={option.action}
              className={`w-full ${option.bgColor} hover:shadow-md border border-gray-100 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-200`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-xl">{option.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {option.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {option.description}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${option.color} text-white`}>
                  {option.duration}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Motivational message */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
        <div className="flex items-start space-x-2">
          <div className="text-lg">🚀</div>
          <div className="flex-1">
            <p className="text-sm text-green-800">
              <strong>Pro tip:</strong> Starting is the hardest part. Once you begin, your ADHD hyperfocus can be your superpower!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
