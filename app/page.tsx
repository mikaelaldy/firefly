'use client'

import { useState, useRef } from 'react'
import { AuthButton } from '@/components/auth/AuthButton'
import { PreferencesButton } from '@/components/PreferencesButton'
import { TaskInput } from '@/components/TaskInput'
import { AIResponse } from '@/components/AIResponse'
import { BufferDeadlineManager } from '@/components/BufferDeadlineManager'
import { HeroSection } from '@/components/landing/HeroSection'
import { FeatureShowcase } from '@/components/landing/FeatureShowcase'
import { DemoPreview } from '@/components/landing/DemoPreview'
import { useAuth } from '@/lib/auth/context'
import type { Task, SuggestResponse, DeadlineInfo, IfThenPlan } from '@/types'

export default function Home() {
  const { user, loading } = useAuth()
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [showAIResponse, setShowAIResponse] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<SuggestResponse | null>(null)
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)
  const [ifThenPlan, setIfThenPlan] = useState<IfThenPlan | null>(null)
  const [showTaskInput, setShowTaskInput] = useState(false)
  const taskInputRef = useRef<HTMLDivElement>(null)

  const handleGetStarted = () => {
    setShowTaskInput(true)
    // Smooth scroll to task input
    setTimeout(() => {
      taskInputRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }, 100)
  }

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
    <div className="min-h-screen bg-white">
      {/* Top navigation - fixed position */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-2">
        <PreferencesButton />
        <AuthButton />
      </div>

      {/* Enhanced Landing Page */}
      {!showTaskInput ? (
        <div>
          {/* Hero Section */}
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
            <div className="max-w-6xl mx-auto">
              <HeroSection onGetStarted={handleGetStarted} />
            </div>
          </div>

          {/* Feature Showcase */}
          <FeatureShowcase />

          {/* Demo Preview */}
          <DemoPreview />

          {/* Final CTA */}
          <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to break through task paralysis?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Your next focused session is just seconds away
              </p>
              <button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 font-bold text-xl px-12 py-6 rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Start Your First Session
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Task Input Interface */
        <main id="main-content" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col items-center justify-center px-6 py-12">
          <div ref={taskInputRef} className="w-full max-w-2xl mx-auto text-center space-y-12">
            
            {/* Back to landing option */}
            <button
              onClick={() => setShowTaskInput(false)}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to overview</span>
            </button>

            {/* Focused hero */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                What do you want to finish?
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                Tell Firefly your goal and get started in seconds
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
          </div>
        </main>
      )}
    </div>
  )
}