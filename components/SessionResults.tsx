'use client'

import { useState } from 'react'
import { getVarianceMessage } from '@/lib/timer-utils'
import { ActionSessionResults } from './ActionSessionResults'
import { useActionSession } from '@/lib/action-sessions/context'
import type { TimerSession } from '@/types'

interface SessionResultsProps {
  session: TimerSession;
  onContinue: () => void;
  onNewTask: () => void;
}

export function SessionResults({ session, onContinue, onNewTask }: SessionResultsProps) {
  const [showDetails, setShowDetails] = useState(false)
  const { state: actionSessionState } = useActionSession()
  
  // Convert durations to minutes for display
  const plannedMinutes = Math.round(session.plannedDuration / 60)
  const actualMinutes = Math.round(session.actualDuration / 60)
  
  // Get friendly variance message
  const varianceMessage = getVarianceMessage(session.variance, plannedMinutes, actualMinutes)
  
  // Determine celebration level based on completion and variance
  const getCelebrationLevel = () => {
    if (session.completed) {
      return 'completed'
    } else if (Math.abs(session.variance) < 20) {
      return 'good'
    } else {
      return 'okay'
    }
  }
  
  const celebrationLevel = getCelebrationLevel()
  
  // Get appropriate emoji and color scheme
  const getDisplayProps = () => {
    switch (celebrationLevel) {
      case 'completed':
        return {
          emoji: '🎉',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        }
      case 'good':
        return {
          emoji: '💪',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        }
      default:
        return {
          emoji: '👍',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800',
          buttonColor: 'bg-purple-600 hover:bg-purple-700'
        }
    }
  }
  
  const displayProps = getDisplayProps()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Action Session Results - show if we have action session data */}
      {actionSessionState.sessionId && actionSessionState.actions.length > 0 && (
        <ActionSessionResults sessionId={actionSessionState.sessionId} />
      )}
      
      <div className={`${displayProps.bgColor} ${displayProps.borderColor} border-2 rounded-2xl p-8 text-center`}>
        {/* Celebration Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4">{displayProps.emoji}</div>
          <h2 className={`text-2xl font-bold ${displayProps.textColor} mb-2`}>
            {session.completed ? 'Session Complete!' : 'Great Focus Session!'}
          </h2>
          <p className="text-gray-600 text-lg">
            {session.goal}
          </p>
        </div>

        {/* Variance Summary */}
        <div className="mb-8">
          <div className={`${displayProps.bgColor} rounded-xl p-6 ${displayProps.borderColor} border`}>
            <p className="text-lg font-medium text-gray-800 mb-4">
              {varianceMessage}
            </p>
            
            {/* Time Breakdown */}
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
              <div className="text-center">
                <div className="font-semibold text-gray-800">{plannedMinutes}m</div>
                <div>Planned</div>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <div className="font-semibold text-gray-800">{actualMinutes}m</div>
                <div>Actual</div>
              </div>
              <div className="text-center">
                <div className={`font-semibold ${session.variance >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {session.variance > 0 ? '+' : ''}{session.variance}%
                </div>
                <div>Variance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Positive Reinforcement */}
        <div className="mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-gray-700 font-medium">
              {session.completed 
                ? "You stayed focused for the entire session! That's excellent self-regulation." 
                : actualMinutes >= plannedMinutes * 0.5
                ? "You made meaningful progress! Every focused minute counts toward building better habits."
                : "You took the first step! Starting is often the hardest part—you're building momentum."
              }
            </p>
          </div>
        </div>

        {/* Session Details Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center mx-auto space-x-1"
          >
            <span>{showDetails ? 'Hide' : 'Show'} session details</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showDetails && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200 text-left text-sm text-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium text-gray-800">Started</div>
                  <div>{session.startedAt.toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Ended</div>
                  <div>{session.completedAt?.toLocaleTimeString() || 'N/A'}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Status</div>
                  <div className={session.completed ? 'text-green-600' : 'text-orange-600'}>
                    {session.completed ? 'Completed' : 'Stopped Early'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Session ID</div>
                  <div className="font-mono text-xs">{session.id.slice(0, 8)}...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onContinue}
            className={`${displayProps.buttonColor} text-white px-8 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-opacity-50`}
          >
            Go to dashboard
          </button>
          
          <button
            onClick={onNewTask}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Start new task
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-6 text-xs text-gray-500">
          <div className="flex justify-center items-center space-x-4">
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Enter</kbd>
              <span>Dashboard</span>
            </div>
            <div className="flex items-center space-x-1">
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">N</kbd>
              <span>New task</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}