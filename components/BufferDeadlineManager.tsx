'use client'

import { useState, useEffect } from 'react'
import type { DeadlineInfo, IfThenPlan, TimelineCheckpoint } from '@/types'

interface BufferDeadlineManagerProps {
  goal: string
  onDeadlineSet?: (deadline: DeadlineInfo) => void
  onIfThenPlanSet?: (plan: IfThenPlan) => void
  className?: string
}

export function BufferDeadlineManager({ 
  goal, 
  onDeadlineSet, 
  onIfThenPlanSet, 
  className = '' 
}: BufferDeadlineManagerProps) {
  const [showDeadlineInput, setShowDeadlineInput] = useState(false)
  const [deadlineInfo, setDeadlineInfo] = useState<DeadlineInfo | null>(null)
  const [ifThenPlan, setIfThenPlan] = useState<IfThenPlan | null>(null)
  const [timelineCheckpoints, setTimelineCheckpoints] = useState<TimelineCheckpoint[]>([])

  // Calculate if deadline is soon and suggest buffer
  const calculateDeadlineInfo = (dueDate: Date): DeadlineInfo => {
    const now = new Date()
    const timeUntilDue = Math.max(0, (dueDate.getTime() - now.getTime()) / (1000 * 60)) // minutes
    const isSoon = timeUntilDue <= 120 // within 2 hours
    const suggestedBuffer = isSoon ? 25 : 15 // 25% if soon, 15% otherwise

    return {
      dueDate,
      timeUntilDue,
      isSoon,
      suggestedBuffer
    }
  }

  // Generate timeline checkpoints
  const generateTimeline = (deadline: DeadlineInfo, estimatedDuration: number = 25): TimelineCheckpoint[] => {
    const now = new Date()
    const checkpoints: TimelineCheckpoint[] = []

    // Start checkpoint
    checkpoints.push({
      time: now,
      label: 'Now',
      type: 'start'
    })

    // If we have enough time, add intermediate checkpoints
    if (deadline.timeUntilDue > 60) {
      const midPoint = new Date(now.getTime() + (deadline.timeUntilDue * 0.5 * 60 * 1000))
      checkpoints.push({
        time: midPoint,
        label: 'Midpoint check',
        type: 'checkpoint',
        isAutoSuggested: true
      })
    }

    // Buffer checkpoint (before deadline)
    const bufferTime = new Date(deadline.dueDate.getTime() - (deadline.suggestedBuffer / 100 * estimatedDuration * 60 * 1000))
    if (bufferTime > now) {
      checkpoints.push({
        time: bufferTime,
        label: `Buffer zone (${deadline.suggestedBuffer}% extra)`,
        type: 'buffer',
        isAutoSuggested: true
      })
    }

    // Deadline checkpoint
    checkpoints.push({
      time: deadline.dueDate,
      label: 'Due',
      type: 'deadline'
    })

    return checkpoints.sort((a, b) => a.time.getTime() - b.time.getTime())
  }

  const handleDeadlineSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const dateStr = formData.get('deadline-date') as string
    const timeStr = formData.get('deadline-time') as string

    if (dateStr && timeStr) {
      const dueDate = new Date(`${dateStr}T${timeStr}`)
      const info = calculateDeadlineInfo(dueDate)
      setDeadlineInfo(info)
      setTimelineCheckpoints(generateTimeline(info))
      onDeadlineSet?.(info)
      setShowDeadlineInput(false)
    }
  }

  const handleIfThenSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const condition = formData.get('condition') as string
    const action = formData.get('action') as string

    if (condition && action) {
      const plan: IfThenPlan = { condition, action }
      setIfThenPlan(plan)
      onIfThenPlanSet?.(plan)
    }
  }

  const formatTimeUntilDue = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const mins = Math.round(minutes % 60)
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    } else {
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Deadline Input Toggle */}
      {!deadlineInfo && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-amber-800 font-medium">Have a deadline?</span>
            </div>
            <button
              onClick={() => setShowDeadlineInput(!showDeadlineInput)}
              className="text-amber-700 hover:text-amber-800 text-sm font-medium underline focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded"
            >
              {showDeadlineInput ? 'Cancel' : 'Add deadline'}
            </button>
          </div>

          {showDeadlineInput && (
            <form onSubmit={handleDeadlineSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="deadline-date" className="block text-sm font-medium text-amber-800 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="deadline-date"
                    name="deadline-date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="deadline-time" className="block text-sm font-medium text-amber-800 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="deadline-time"
                    name="deadline-time"
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white text-gray-900"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors text-sm"
              >
                Set Deadline
              </button>
            </form>
          )}
        </div>
      )}

      {/* Deadline Info with Buffer Suggestion */}
      {deadlineInfo && (
        <div className={`border rounded-lg p-4 ${
          deadlineInfo.isSoon 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <svg className={`w-5 h-5 ${
                deadlineInfo.isSoon ? 'text-red-600' : 'text-green-600'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-medium ${
                deadlineInfo.isSoon ? 'text-red-800' : 'text-green-800'
              }`}>
                Due in {formatTimeUntilDue(deadlineInfo.timeUntilDue)}
              </span>
            </div>
            <button
              onClick={() => {
                setDeadlineInfo(null)
                setTimelineCheckpoints([])
                setShowDeadlineInput(false)
              }}
              className={`text-xs ${
                deadlineInfo.isSoon ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
              } underline`}
            >
              Remove
            </button>
          </div>

          {/* Buffer Recommendation - Requirement 5.1 */}
          {deadlineInfo.isSoon && (
            <div className="bg-red-100 border border-red-300 rounded-md p-3 mb-3">
              <div className="flex items-start space-x-2">
                <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-800 text-sm font-medium">
                    ⚡ Deadline approaching! 
                  </p>
                  <p className="text-red-700 text-sm mt-1">
                    Consider adding {deadlineInfo.suggestedBuffer}% buffer time to account for unexpected delays.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className={`text-sm ${
            deadlineInfo.isSoon ? 'text-red-700' : 'text-green-700'
          }`}>
            Due: {deadlineInfo.dueDate.toLocaleDateString()} at {formatTime(deadlineInfo.dueDate)}
          </p>
        </div>
      )}

      {/* Visual Timeline - Requirements 5.3, 5.5 */}
      {timelineCheckpoints.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium mb-3 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Timeline</span>
          </h4>
          
          <div className="space-y-3">
            {timelineCheckpoints.map((checkpoint, index) => (
              <div key={index} className="flex items-center space-x-3">
                {/* Timeline dot */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  checkpoint.type === 'start' ? 'bg-blue-500' :
                  checkpoint.type === 'checkpoint' ? 'bg-purple-400' :
                  checkpoint.type === 'buffer' ? 'bg-amber-500' :
                  'bg-red-500'
                }`}></div>
                
                {/* Timeline line */}
                {index < timelineCheckpoints.length - 1 && (
                  <div className="absolute ml-1.5 mt-3 w-0.5 h-6 bg-gray-300"></div>
                )}
                
                {/* Checkpoint info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      checkpoint.type === 'deadline' ? 'text-red-700' :
                      checkpoint.type === 'buffer' ? 'text-amber-700' :
                      'text-blue-700'
                    }`}>
                      {checkpoint.label}
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatTime(checkpoint.time)}
                    </span>
                  </div>
                  {checkpoint.isAutoSuggested && (
                    <p className="text-xs text-gray-500 mt-1">Auto-suggested checkpoint</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If-Then Planning - Requirement 5.2 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-purple-800 font-medium mb-3 flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>If-Then Plan (Optional)</span>
        </h4>

        {!ifThenPlan ? (
          <form onSubmit={handleIfThenSubmit} className="space-y-3">
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-purple-800 mb-1">
                If...
              </label>
              <input
                type="text"
                id="condition"
                name="condition"
                placeholder="e.g., it's 9 AM and I haven't started"
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <div>
              <label htmlFor="action" className="block text-sm font-medium text-purple-800 mb-1">
                Then...
              </label>
              <input
                type="text"
                id="action"
                name="action"
                placeholder="e.g., do a 10-minute warm-up task"
                className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white text-gray-900 placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-sm"
            >
              Set If-Then Plan
            </button>
          </form>
        ) : (
          <div className="bg-white border border-purple-300 rounded-md p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-purple-800 text-sm">
                  <span className="font-medium">If</span> {ifThenPlan.condition}
                </p>
                <p className="text-purple-800 text-sm mt-1">
                  <span className="font-medium">Then</span> {ifThenPlan.action}
                </p>
              </div>
              <button
                onClick={() => setIfThenPlan(null)}
                className="text-purple-600 hover:text-purple-700 text-xs underline ml-2 flex-shrink-0"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-purple-600 mt-2">
          💡 If-Then plans help you prepare for obstacles and stay on track
        </p>
      </div>
    </div>
  )
}