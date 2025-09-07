'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { EditableNextActions } from './EditableNextActions'
import type { SuggestResponse, EditableAction } from '@/types'

interface AIResponseProps {
  goal: string
  onSuggestionsReceived?: (suggestions: SuggestResponse) => void
  onActionsChange?: (actions: EditableAction[]) => void
  className?: string
}

export function AIResponse({ goal, onSuggestionsReceived, onActionsChange, className = '' }: AIResponseProps) {
  const [suggestions, setSuggestions] = useState<SuggestResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [currentGoal, setCurrentGoal] = useState<string>('')

  const fetchSuggestions = useCallback(async (goalToFetch: string, retryAttempt = 0) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching AI suggestions for goal:', goalToFetch, 'Retry attempt:', retryAttempt)
      
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: goalToFetch.trim(),
          urgency: 'medium'
        }),
      })

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      const suggestionsData: SuggestResponse = await response.json()
      console.log('AI suggestions received:', suggestionsData)
      
      setSuggestions(suggestionsData)
      onSuggestionsReceived?.(suggestionsData)
      
    } catch (err) {
      console.error('Error fetching AI suggestions:', err)
      
      // Progressive enhancement: provide fallback suggestions even on error
      const fallbackSuggestions: SuggestResponse = {
        firstStep: {
          description: "Take a deep breath and write down exactly what you want to accomplish",
          estimatedSeconds: 60
        },
        nextActions: [
          "Break your goal into 3 smaller steps",
          "Choose the easiest step to start with",
          "Set up your workspace for focused work",
          "Remove any distractions from your environment"
        ],
        fallbackUsed: true
      }
      
      setSuggestions(fallbackSuggestions)
      onSuggestionsReceived?.(fallbackSuggestions)
      
      // Set error state but don't block the UI
      if (retryAttempt < 2) {
        setError(`Having trouble connecting to AI. Using smart fallback suggestions.`)
      } else {
        setError('AI temporarily unavailable. Using fallback suggestions.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [onSuggestionsReceived])

  const handleRetry = () => {
    const newRetryCount = retryCount + 1
    setRetryCount(newRetryCount)
    setIsLoading(true)
    fetchSuggestions(currentGoal, newRetryCount)
  }

  useEffect(() => {
    const trimmedGoal = goal.trim()
    
    // Only fetch if goal has changed and is not empty
    if (trimmedGoal && trimmedGoal !== currentGoal) {
      // Reset state for new goal
      setCurrentGoal(trimmedGoal)
      setSuggestions(null)
      setError(null)
      setRetryCount(0)
      setIsLoading(true)
      
      // Start fetching
      fetchSuggestions(trimmedGoal)
    } else if (!trimmedGoal && currentGoal) {
      // Reset everything if goal becomes empty
      setCurrentGoal('')
      setSuggestions(null)
      setError(null)
      setRetryCount(0)
      setIsLoading(false)
    }
  }, [goal, currentGoal, fetchSuggestions])

  // Loading state - Requirement 2.6 (never block Start button)
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Loading placeholder that doesn't block timer start */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-blue-300 rounded animate-spin"></div>
            <div className="h-4 bg-blue-300 rounded w-32"></div>
          </div>
          <div className="h-4 bg-blue-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-purple-300 rounded w-24 mb-2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-purple-200 rounded w-full"></div>
            <div className="h-3 bg-purple-200 rounded w-5/6"></div>
            <div className="h-3 bg-purple-200 rounded w-4/5"></div>
          </div>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          🤖 AI is thinking... You can start your timer anytime!
        </p>
      </div>
    )
  }

  // Error state with retry option - Progressive enhancement
  if (error && !suggestions) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-yellow-800 text-sm font-medium">AI Temporarily Unavailable</p>
              <p className="text-yellow-700 text-sm mt-1">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 text-yellow-800 hover:text-yellow-900 text-sm font-medium underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 text-center">
          💡 You can still start your focus timer and work on your goal!
        </p>
      </div>
    )
  }

  // Success state - Display AI suggestions inline
  if (suggestions) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* First Step - 60 second mini-task (Requirement 2.2) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <h3 className="text-blue-800 font-semibold text-sm">
              🚀 First Small Step (60 seconds)
            </h3>
          </div>
          <p className="text-blue-700 leading-relaxed">
            {suggestions.firstStep.description}
          </p>
          <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>~{suggestions.firstStep.estimatedSeconds} seconds</span>
          </div>
        </div>

        {/* Next Actions - Editable with AI re-estimation (Requirements 12.1, 12.2, 12.3) */}
        {suggestions.nextActions && suggestions.nextActions.length > 0 && (
          <EditableNextActions
            initialActions={suggestions.nextActions}
            onActionsChange={onActionsChange}
            context={goal}
            className="transition-all duration-200 hover:shadow-md"
          />
        )}

        {/* Buffer recommendation */}
        {suggestions.bufferRecommendation && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-amber-800 text-sm">
                💡 Consider adding {suggestions.bufferRecommendation}% extra time for this task
              </p>
            </div>
          </div>
        )}

        {/* Error indicator with fallback notice */}
        {error && suggestions.fallbackUsed && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 text-center flex items-center justify-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Fallback indicator */}
        {suggestions.fallbackUsed && !error && (
          <p className="text-xs text-gray-500 text-center">
            💡 Using smart fallback suggestions
          </p>
        )}
      </div>
    )
  }

  return null
}