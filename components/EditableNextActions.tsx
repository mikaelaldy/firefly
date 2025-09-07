'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { EditableAction, EstimateRequest, EstimateResponse } from '@/types'

interface EditableNextActionsProps {
  initialActions: string[]
  onActionsChange?: (actions: EditableAction[]) => void
  className?: string
  context?: string // Optional context for AI estimation
}

export function EditableNextActions({ 
  initialActions, 
  onActionsChange, 
  className = '',
  context
}: EditableNextActionsProps) {
  // Convert initial string actions to EditableAction objects
  const [actions, setActions] = useState<EditableAction[]>(() =>
    initialActions.map((action, index) => ({
      id: `action-${index}-${Date.now()}`,
      text: action,
      isCustom: false,
      originalText: action
    }))
  )
  
  const [hasAutoEstimated, setHasAutoEstimated] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isEstimating, setIsEstimating] = useState(false)
  const [estimationError, setEstimationError] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Notify parent of changes
  useEffect(() => {
    onActionsChange?.(actions)
  }, [actions, onActionsChange])

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingId])

  const startEditing = (action: EditableAction) => {
    setEditingId(action.id)
    setEditingText(action.text)
  }

  const saveEdit = () => {
    if (!editingId || !editingText.trim()) {
      cancelEdit()
      return
    }

    setActions(prev => prev.map(action => 
      action.id === editingId 
        ? { 
            ...action, 
            text: editingText.trim(),
            isCustom: editingText.trim() !== action.originalText
          }
        : action
    ))

    setEditingId(null)
    setEditingText('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingText('')
  }

  const deleteAction = (actionId: string) => {
    setActions(prev => prev.filter(action => action.id !== actionId))
  }

  const addAction = () => {
    const newAction: EditableAction = {
      id: `action-custom-${Date.now()}`,
      text: '',
      isCustom: true,
      originalText: ''
    }
    setActions(prev => [...prev, newAction])
    // Immediately start editing the new action
    setEditingId(newAction.id)
    setEditingText('')
  }

  const moveAction = (actionId: string, direction: 'up' | 'down') => {
    setActions(prev => {
      const currentIndex = prev.findIndex(action => action.id === actionId)
      if (currentIndex === -1) return prev
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= prev.length) return prev
      
      const newActions = [...prev]
      const [movedAction] = newActions.splice(currentIndex, 1)
      newActions.splice(newIndex, 0, movedAction)
      return newActions
    })
  }

  const updateWithAI = useCallback(async () => {
    if (actions.length === 0) return
    
    setIsEstimating(true)
    setEstimationError(null)
    
    try {
      const requestBody: EstimateRequest = {
        actions: actions.map(action => action.text),
        context
      }
      
      const response = await fetch('/api/ai/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }
      
      const estimationData: EstimateResponse = await response.json()
      
      // Update actions with AI estimates
      setActions(prev => prev.map((action, index) => {
        const estimate = estimationData.estimatedActions[index]
        if (estimate) {
          return {
            ...action,
            estimatedMinutes: estimate.estimatedMinutes,
            confidence: estimate.confidence
          }
        }
        return action
      }))
      
    } catch (error) {
      console.error('AI estimation failed:', error)
      setEstimationError('Failed to get AI estimates. Please try again.')
    } finally {
      setIsEstimating(false)
    }
  }, [actions, context])

  // Auto-estimate when component first loads with actions
  useEffect(() => {
    if (!hasAutoEstimated && actions.length > 0 && actions.every(action => !action.estimatedMinutes)) {
      setHasAutoEstimated(true)
      // Delay the auto-estimation slightly to avoid UI blocking
      setTimeout(() => {
        updateWithAI()
      }, 500)
    }
  }, [actions, hasAutoEstimated, updateWithAI])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <div className={`bg-purple-50 border border-purple-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-purple-800 font-semibold text-sm">
            📋 Next Actions
          </h3>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
            Click to edit
          </span>
        </div>
        
        {/* Total Time Estimate */}
        {(() => {
          const totalTime = actions.reduce((sum, action) => sum + (action.estimatedMinutes || 0), 0)
          if (totalTime > 0) {
            return (
              <div className="flex items-center space-x-1 text-sm text-purple-700 bg-purple-100 px-2 py-1 rounded">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Total: {totalTime}m</span>
              </div>
            )
          }
          return null
        })()}
      </div>

      <ul className="space-y-2">
        {actions.map((action, index) => (
          <li key={action.id} className="flex items-start space-x-3 group">
            <span className="text-purple-500 font-medium text-sm mt-0.5 flex-shrink-0">
              {index + 2}.
            </span>
            
            <div className="flex-1 min-w-0">
              {editingId === action.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    className="flex-1 text-sm bg-white border border-purple-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter action..."
                  />
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={saveEdit}
                      className="p-1 text-green-600 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 rounded"
                      title="Save (Enter)"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
                      title="Cancel (Escape)"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="text-sm leading-relaxed text-purple-700 cursor-pointer hover:bg-purple-100 rounded px-2 py-1 -mx-2 -my-1 transition-colors duration-150 group-hover:bg-purple-100"
                  onClick={() => startEditing(action)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      startEditing(action)
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <span className="flex-1">{action.text}</span>
                    <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                      {action.estimatedMinutes && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs text-purple-600 font-medium">
                            {action.estimatedMinutes}m
                          </span>
                          {action.confidence && (
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              action.confidence === 'high' ? 'bg-green-100 text-green-700' :
                              action.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {action.confidence}
                            </span>
                          )}
                        </div>
                      )}
                      {action.isCustom && (
                        <span className="text-xs text-purple-500 bg-purple-200 px-1 py-0.5 rounded">
                          edited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action controls - only show when not editing */}
            {editingId !== action.id && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {/* Reorder buttons */}
                {index > 0 && (
                  <button
                    onClick={() => moveAction(action.id, 'up')}
                    className="p-1 text-purple-400 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                    title="Move up"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {index < actions.length - 1 && (
                  <button
                    onClick={() => moveAction(action.id, 'down')}
                    className="p-1 text-purple-400 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                    title="Move down"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                
                {/* Edit button */}
                <button
                  onClick={() => startEditing(action)}
                  className="p-1 text-purple-400 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                  title="Edit action"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                
                {/* Delete button */}
                <button
                  onClick={() => {
                    if (window.confirm('Delete this action?')) {
                      deleteAction(action.id)
                    }
                  }}
                  className="p-1 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  title="Delete action"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Action Controls */}
      <div className="mt-3 pt-3 border-t border-purple-200 space-y-2">
        <div className="flex items-center justify-between">
          <button
            onClick={addAction}
            className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 hover:bg-purple-100 transition-colors duration-150"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">Add Action</span>
          </button>
          
          <button
            onClick={updateWithAI}
            disabled={isEstimating || actions.length === 0}
            className="flex items-center space-x-2 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-3 py-1.5 text-sm font-medium transition-colors duration-150"
          >
            {isEstimating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v11H4V4z" clipRule="evenodd" />
                </svg>
                <span>Estimating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span>Update with AI</span>
              </>
            )}
          </button>
        </div>
        
        {/* AI Estimation Status */}
        {isEstimating && (
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-700">
                🤖 AI is analyzing your actions for time estimates...
              </span>
            </div>
          </div>
        )}
        
        {/* AI Estimation Error */}
        {estimationError && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">{estimationError}</p>
                <button
                  onClick={() => setEstimationError(null)}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual feedback for editing mode */}
      {editingId && (
        <div className="mt-3 text-xs text-purple-600 bg-purple-100 rounded px-2 py-1">
          💡 Press Enter to save, Escape to cancel
        </div>
      )}
    </div>
  )
}