'use client'

import { useState } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { TaskInput } from '@/components/TaskInput'
import { useAuth } from '@/lib/auth/context'
import type { Task } from '@/types'

export default function Home() {
  const { user, loading } = useAuth()
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  const handleTaskCreated = (task: Task) => {
    setCurrentTask(task)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Auth button - fixed position */}
      <div className="absolute top-6 right-6 z-10">
        <AuthButton />
      </div>

      {/* Main content */}
      <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl mx-auto text-center space-y-12">
          
          {/* Hero section */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>ADHD-Friendly Focus Tool</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Firefly
            </h1>
            
            <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
              Break through task paralysis with AI-powered micro-tasks and smart timers
            </p>
          </div>

          {/* Task Input */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <TaskInput onTaskCreated={handleTaskCreated} />
          </div>

          {/* Success state */}
          {currentTask && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-800 font-semibold text-lg">Task Created!</span>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-gray-800 font-medium">
                  {currentTask.goal}
                </p>
              </div>

              {/* AI Suggestions Display - Requirements 2.2, 2.3, 2.6 */}
              {currentTask.suggestions && (
                <div className="space-y-4 mt-4">
                  {/* First Step - 60 second mini-task (Requirement 2.2) */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-blue-800 font-semibold text-sm mb-2">
                      🚀 First Small Step (60 seconds)
                    </h3>
                    <p className="text-blue-700">
                      {currentTask.suggestions.firstStep.description}
                    </p>
                  </div>

                  {/* Next Actions - 3-5 actionable steps (Requirement 2.3) */}
                  {currentTask.suggestions.nextActions && currentTask.suggestions.nextActions.length > 0 && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h3 className="text-purple-800 font-semibold text-sm mb-2">
                        📋 Next Actions
                      </h3>
                      <ul className="space-y-2">
                        {currentTask.suggestions.nextActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-2 text-purple-700">
                            <span className="text-purple-500 font-medium">{index + 1}.</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fallback indicator */}
                  {currentTask.suggestions.fallbackUsed && (
                    <p className="text-xs text-gray-500 text-center">
                      💡 Using smart fallback suggestions
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-green-700 text-sm mt-4">
                🎯 Ready to start a focused timer
              </p>
            </div>
          )}

          {/* Status indicator */}
          {!loading && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <span className="text-gray-600">
                {user ? (
                  'Signed in - Tasks saved across sessions'
                ) : (
                  'Works offline - Timer and local progress available'
                )}
              </span>
            </div>
          )}

          {/* Features preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Smart Timers</h3>
              <p className="text-sm text-gray-600">Time-aware sessions that adapt to your focus patterns</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">AI Micro-Tasks</h3>
              <p className="text-sm text-gray-600">Break overwhelming goals into manageable steps</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Focus Flow</h3>
              <p className="text-sm text-gray-600">Maintain momentum with distraction-free design</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}