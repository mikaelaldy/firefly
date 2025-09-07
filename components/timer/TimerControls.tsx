'use client'

import type { TimerState } from '@/types'

interface TimerControlsProps {
  timerState: TimerState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  stopLabel?: string;
}

export function TimerControls({ timerState, onPause, onResume, onStop, stopLabel = 'Stop' }: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center space-x-4">
      {/* Pause/Resume Button */}
      {timerState.isActive && (
        <button
          onClick={timerState.isPaused ? onResume : onPause}
          className={`
            flex items-center justify-center w-16 h-16 rounded-full font-semibold
            focus:outline-none focus:ring-4 transition-all duration-200 transform hover:scale-105 active:scale-95
            ${timerState.isPaused 
              ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-200' 
              : 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-200'
            }
          `}
          aria-label={timerState.isPaused ? 'Resume timer' : 'Pause timer'}
        >
          {timerState.isPaused ? (
            // Play icon for resume
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          ) : (
            // Pause icon
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      )}

      {/* Stop Button */}
      {timerState.isActive && (
        <button
          onClick={onStop}
          className="
            flex items-center justify-center w-16 h-16 rounded-full
            bg-red-600 hover:bg-red-700 text-white font-semibold
            focus:outline-none focus:ring-4 focus:ring-red-200
            transition-all duration-200 transform hover:scale-105 active:scale-95
          "
          aria-label="Stop timer"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Control labels */}
      <div className="ml-6 text-sm text-gray-600">
        <div className="flex flex-col space-y-1">
          {timerState.isActive && (
            <>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Space</kbd>
                <span>{timerState.isPaused ? 'Resume' : 'Pause'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="px-2 py-1 text-xs bg-gray-100 rounded">Esc</kbd>
                <span>{stopLabel}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}