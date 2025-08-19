'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { clientDb } from '@/lib/supabase/client-db'
import type { Task } from '@/types'

interface TaskInputProps {
  onTaskCreated?: (task: Task) => void
}

export function TaskInput({ onTaskCreated }: TaskInputProps) {
  const [goal, setGoal] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation - requirement 1.1 (prevent empty submission)
    if (!goal.trim()) {
      setError('Please enter what you want to finish')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      // Create task with optimistic UI - requirement 1.2
      const taskData = {
        user_id: user?.id || 'anonymous', // Handle non-authenticated users
        goal: goal.trim(),
        urgency: 'medium' as const,
      }

      // Optimistic UI - show success immediately
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`, // Temporary ID for optimistic UI
        ...taskData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Call onTaskCreated immediately for optimistic UI
      onTaskCreated?.(optimisticTask)

      // Clear input immediately for better UX
      setGoal('')

      // Call AI suggest API to get breakdown (requirement 2.1, 2.2, 2.3, 2.6)
      try {
        console.log('Calling AI suggest API for goal:', goal.trim())
        const aiResponse = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            goal: goal.trim(),
            urgency: 'medium'
          }),
        })

        if (aiResponse.ok) {
          const suggestions = await aiResponse.json()
          console.log('AI suggestions received:', suggestions)
          // Store suggestions in the task object for display
          const taskWithSuggestions = {
            ...optimisticTask,
            suggestions
          }
          onTaskCreated?.(taskWithSuggestions)
        } else {
          console.error('AI API response not ok:', aiResponse.status, aiResponse.statusText)
        }
      } catch (aiError) {
        console.error('AI suggest API error:', aiError)
        // Continue without AI suggestions - app should never block (requirement 2.7)
      }

      // Create task in database (this happens in background)
      if (user) {
        const createdTask = await clientDb.createTask(taskData)
        if (createdTask) {
          // Update with real task data if needed
          onTaskCreated?.(createdTask)
        }
      }
      // If no user, we still proceed with local state (requirement 6.3)
      
    } catch (err) {
      console.error('Error creating task:', err)
      setError('Something went wrong. Please try again.')
      // Restore the goal text if there was an error
      setGoal(goal)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main input - requirement 1.1 (centered, single input) */}
        <div>
          <label htmlFor="goal-input" className="block text-sm font-medium text-gray-700 mb-3 text-left">
            What do you want to finish today?
          </label>
          <div className="relative">
            <input
              id="goal-input"
              type="text"
              value={goal}
              onChange={(e) => {
                setGoal(e.target.value)
                if (error) setError('') // Clear error on typing
              }}
              placeholder="e.g., Write the project proposal, Clean my desk, Call the dentist..."
              className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
              disabled={isSubmitting}
              autoFocus
              maxLength={500}
            />
            {goal.length > 0 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-xs text-gray-400">{goal.length}/500</span>
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm" role="alert">
              {error}
            </p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !goal.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating your task...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Focusing</span>
            </div>
          )}
        </button>

        {/* Helper text */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Press Enter or click the button to create your task and get AI-powered next steps
          </p>
        </div>
      </form>
    </div>
  )
}