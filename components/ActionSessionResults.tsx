'use client'

import { useEffect, useState } from 'react'
import { useActionSession } from '@/lib/action-sessions/context'
import type { EditableAction } from '@/types'

interface ActionSessionResultsProps {
  sessionId?: string
  className?: string
}

export function ActionSessionResults({ sessionId, className = '' }: ActionSessionResultsProps) {
  const { state: actionSessionState, loadSession } = useActionSession()
  const [loading, setLoading] = useState(false)

  // Load session if sessionId is provided and different from current
  useEffect(() => {
    if (sessionId && sessionId !== actionSessionState.sessionId) {
      setLoading(true)
      loadSession(sessionId).finally(() => setLoading(false))
    }
  }, [sessionId, actionSessionState.sessionId, loadSession])

  // Don't render if no session data
  if (!actionSessionState.sessionId || actionSessionState.actions.length === 0) {
    return null
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const completedActions = actionSessionState.actions.filter(action => 
    actionSessionState.completedActionIds.has(action.id)
  )
  const completionRate = actionSessionState.actions.length > 0 
    ? (completedActions.length / actionSessionState.actions.length) * 100 
    : 0

  const totalEstimatedTime = actionSessionState.totalEstimatedTime
  const actualTimeSpent = actionSessionState.actualTimeSpent
  const timeVariance = totalEstimatedTime > 0 
    ? ((actualTimeSpent - totalEstimatedTime) / totalEstimatedTime) * 100 
    : 0

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Action Progress</h3>
          <p className="text-gray-600 text-sm">Your focus session breakdown</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {completedActions.length}/{actionSessionState.actions.length}
          </div>
          <div className="text-blue-700 text-sm font-medium">Actions Completed</div>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {actualTimeSpent}m
          </div>
          <div className="text-green-700 text-sm font-medium">Time Spent</div>
          <div className="text-green-600 text-xs mt-1">
            Est: {totalEstimatedTime}m
          </div>
        </div>

        <div className={`rounded-lg p-4 ${
          Math.abs(timeVariance) < 20 
            ? 'bg-green-50' 
            : timeVariance > 0 
            ? 'bg-yellow-50' 
            : 'bg-blue-50'
        }`}>
          <div className={`text-2xl font-bold mb-1 ${
            Math.abs(timeVariance) < 20 
              ? 'text-green-600' 
              : timeVariance > 0 
              ? 'text-yellow-600' 
              : 'text-blue-600'
          }`}>
            {timeVariance > 0 ? '+' : ''}{Math.round(timeVariance)}%
          </div>
          <div className={`text-sm font-medium ${
            Math.abs(timeVariance) < 20 
              ? 'text-green-700' 
              : timeVariance > 0 
              ? 'text-yellow-700' 
              : 'text-blue-700'
          }`}>
            Time Variance
          </div>
          <div className={`text-xs mt-1 ${
            Math.abs(timeVariance) < 20 
              ? 'text-green-600' 
              : timeVariance > 0 
              ? 'text-yellow-600' 
              : 'text-blue-600'
          }`}>
            {Math.abs(timeVariance) < 20 
              ? 'Great accuracy!' 
              : timeVariance > 0 
              ? 'Took longer' 
              : 'Finished early'
            }
          </div>
        </div>
      </div>

      {/* Action Details */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 mb-3">Action Breakdown</h4>
        {actionSessionState.actions.map((action, index) => {
          const isCompleted = actionSessionState.completedActionIds.has(action.id)
          return (
            <div 
              key={action.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border ${
                isCompleted 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* Status indicator */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>

              {/* Action content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <p className={`text-sm leading-relaxed ${
                    isCompleted ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {action.text}
                  </p>
                  <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                    {action.estimatedMinutes && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isCompleted 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {action.estimatedMinutes}m
                      </span>
                    )}
                    {action.confidence && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        action.confidence === 'high' 
                          ? 'bg-green-100 text-green-700' 
                          : action.confidence === 'medium' 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {action.confidence}
                      </span>
                    )}
                  </div>
                </div>
                {action.isCustom && (
                  <span className="inline-block text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full mt-1">
                    Custom action
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Encouragement message */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-blue-800 text-sm font-medium mb-1">
              {completionRate === 100 
                ? "🎉 Amazing! You completed all your actions!" 
                : completionRate >= 75 
                ? "🌟 Great progress! You're building excellent focus habits." 
                : completionRate >= 50 
                ? "👍 Good work! Every completed action is a win." 
                : "💪 You started, and that's what matters most!"
              }
            </p>
            <p className="text-blue-700 text-xs">
              {timeVariance > 20 
                ? "Taking longer than estimated is normal with ADHD. You're learning about your own pace!" 
                : timeVariance < -20 
                ? "Finishing early shows great focus! Consider adding buffer time for transitions." 
                : "Your time estimation is getting more accurate - that's a valuable ADHD skill!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}