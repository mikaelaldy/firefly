'use client'

import { useState } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { TaskInput } from '@/components/TaskInput'
import { AIResponse } from '@/components/AIResponse'
import { BufferDeadlineManager } from '@/components/BufferDeadlineManager'
import { useAuth } from '@/lib/auth/context'
import type { Task, SuggestResponse, DeadlineInfo, IfThenPlan } from '@/types'

export default function Home() {
  const { user, loading } = useAuth()
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [showAIResponse, setShowAIResponse] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<SuggestResponse | null>(null)
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)
  const [ifThenPlan, setIfThenPlan] = useState<IfThenPlan | null>(null)

  const handleTaskCreated = (task: Task) => {
    setCurrentTask(task)
    setShowAIResponse(true)
    setAiSuggestions(null) // Reset AI suggestions for new task
  }

  const handleSuggestionsReceived = (suggestions: SuggestResponse) => {
    setAiSuggestions(suggestions)
    // Update current task with suggestions if it exists
    if (currentTask) {
      setCurrentTask({
        ...currentTask,
        suggestions
      })
    }
  }

  const handleStartTimer = () => {
    // Progressive enhancement: Timer can start regardless of AI status
    console.log('Starting timer for goal:', currentTask?.goal)
    
    // Build URL with goal and optional deadline info
    const params = new URLSearchParams()
    if (currentTask?.goal) {
      params.set('goal', currentTask.goal)
    }
    if (currentTask?.id) {
      params.set('taskId', currentTask.id)
    }
    if (deadlineInfo) {
      params.set('deadline', deadlineInfo.dueDate.toISOString())
      params.set('buffer', deadlineInfo.suggestedBuffer.toString())
    }
    
    // Navigate to timer page
    window.location.href = `/timer?${params.toString()}`
  }

  const handleDeadlineSet = (deadline: DeadlineInfo) => {
    setDeadlineInfo(deadline)
  }

  const handleIfThenPlanSet = (plan: IfThenPlan) => {
    setIfThenPlan(plan)
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

          {/* Task created state with AI Response */}
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
              
              <div className="bg-white rounded-lg p-4 mb-6">
                <p className="text-gray-800 font-medium">
                  {currentTask.goal}
                </p>
              </div>

              {/* AI Response Component - Requirements 1.3, 2.6 */}
              {showAIResponse && (
                <div className="mb-6">
                  <AIResponse 
                    goal={currentTask.goal}
                    onSuggestionsReceived={handleSuggestionsReceived}
                  />
                </div>
              )}

              {/* Buffer & Deadline Manager - Requirements 5.1, 5.2, 5.3, 5.5 */}
              <div className="mb-6">
                <BufferDeadlineManager
                  goal={currentTask.goal}
                  onDeadlineSet={handleDeadlineSet}
                  onIfThenPlanSet={handleIfThenPlanSet}
                />
              </div>
              
              {/* Timer Start Button - Progressive Enhancement */}
              <div className="flex flex-col items-center space-y-3">
                <button
                  onClick={handleStartTimer}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-green-200 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span>Start Focus Timer</span>
                  </div>
                </button>
                
                <p className="text-green-700 text-sm text-center">
                  🎯 Timer works immediately - AI suggestions enhance your focus!
                </p>
              </div>
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