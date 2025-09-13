'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatTime } from '@/lib/timer-utils'

interface ActionNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  direction: 'previous' | 'next';
  currentActionText: string;
  targetActionText: string;
  currentProgress?: {
    timeSpent: number;
    estimatedTime: number;
  };
}

export function ActionNavigationModal({
  isOpen,
  onClose,
  onConfirm,
  direction,
  currentActionText,
  targetActionText,
  currentProgress
}: ActionNavigationModalProps) {
  const isNext = direction === 'next'
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Switch to {isNext ? 'Next' : 'Previous'} Action?</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-gray-700">
                You're currently working on an action. Switching will pause the current timer.
              </p>
              
              {/* Current action info */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                <div className="font-medium text-orange-800 text-sm">
                  Current Action:
                </div>
                <div className="text-orange-700 text-sm">
                  {currentActionText}
                </div>
                
                {currentProgress && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600">Time spent:</span>
                    <span className="font-medium text-orange-800">
                      {currentProgress.timeSpent}m / {currentProgress.estimatedTime}m
                    </span>
                  </div>
                )}
              </div>

              {/* Target action info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-medium text-blue-800 text-sm mb-1">
                  {isNext ? 'Next' : 'Previous'} Action:
                </div>
                <div className="text-blue-700 text-sm">
                  {targetActionText}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="text-gray-600 text-sm">
                    Your current progress will be saved, and you can return to this action later.
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Continue Current Action
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
          >
            Switch to {isNext ? 'Next' : 'Previous'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}