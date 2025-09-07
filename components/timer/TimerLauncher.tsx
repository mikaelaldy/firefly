'use client'

import { useState } from 'react'
import type { EditableAction } from '@/types'

interface TimerLauncherProps {
  onSelectDuration: (minutes: number, actionContext?: EditableAction) => void;
  disabled?: boolean;
  actions?: EditableAction[];
  showPresets?: boolean;
}

export function TimerLauncher({ 
  onSelectDuration, 
  disabled = false, 
  actions = [], 
  showPresets = true 
}: TimerLauncherProps) {
  const [selectedMode, setSelectedMode] = useState<'presets' | 'actions'>('presets')

  const presets = [
    { minutes: 25, label: '25 min', description: 'Pomodoro Focus' },
    { minutes: 45, label: '45 min', description: 'Deep Work' },
    { minutes: 50, label: '50 min', description: 'Extended Focus' }
  ]

  // Filter actions that have time estimates
  const actionsWithEstimates = actions.filter(action => action.estimatedMinutes && action.estimatedMinutes > 0)
  const hasActionEstimates = actionsWithEstimates.length > 0

  // Auto-select actions mode if we have estimates and no presets requested
  const effectiveMode = hasActionEstimates && !showPresets ? 'actions' : selectedMode

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Choose Focus Duration
        </h3>
        
        {/* Mode selector - only show if we have both options */}
        {hasActionEstimates && showPresets && (
          <div className="flex items-center justify-center space-x-1 mb-4">
            <button
              onClick={() => setSelectedMode('presets')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                effectiveMode === 'presets'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Standard Presets
            </button>
            <button
              onClick={() => setSelectedMode('actions')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                effectiveMode === 'actions'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Action Estimates ({actionsWithEstimates.length})
            </button>
          </div>
        )}
      </div>

      {/* Preset Duration Options */}
      {effectiveMode === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {presets.map(({ minutes, label, description }) => (
            <button
              key={minutes}
              onClick={() => onSelectDuration(minutes)}
              disabled={disabled}
              className={`
                p-6 rounded-xl border-2 text-center transition-all duration-200 transform
                focus:outline-none focus:ring-4 focus:ring-blue-200
                ${disabled 
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-105 active:scale-95 cursor-pointer'
                }
              `}
              aria-label={`Start ${minutes} minute timer for ${description}`}
            >
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {label}
              </div>
              <div className="text-sm text-gray-600">
                {description}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Action-Based Duration Options */}
      {effectiveMode === 'actions' && (
        <div className="space-y-3">
          {actionsWithEstimates.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {actionsWithEstimates.map((action, index) => (
                <button
                  key={action.id}
                  onClick={() => onSelectDuration(action.estimatedMinutes!, action)}
                  disabled={disabled}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all duration-200 transform
                    focus:outline-none focus:ring-4 focus:ring-purple-200
                    ${disabled 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                    }
                  `}
                  aria-label={`Start ${action.estimatedMinutes} minute timer for: ${action.text}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-purple-600 font-semibold text-sm">
                          Action {index + 1}
                        </span>
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-purple-600 font-bold">
                            {action.estimatedMinutes}m
                          </span>
                          {action.confidence && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              action.confidence === 'high' ? 'bg-green-100 text-green-700' :
                              action.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {action.confidence}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {action.text}
                      </p>
                      {action.isCustom && (
                        <span className="inline-block mt-1 text-xs text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="ml-3 flex-shrink-0">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm">No time estimates available</p>
              <p className="text-xs mt-1">Use &quot;Update with AI&quot; to get estimates for your actions</p>
            </div>
          )}
        </div>
      )}
      
      <div className="text-center text-sm text-gray-500">
        <p>💡 Timer starts immediately - no waiting for AI suggestions</p>
      </div>
    </div>
  )
}