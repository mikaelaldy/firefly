'use client'

import { useState } from 'react'
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

interface ActionCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionText: string;
  estimatedMinutes: number;
  actualMinutes: number;
  nextActionText?: string;
}

export function ActionCompletionModal({
  isOpen,
  onClose,
  onConfirm,
  actionText,
  estimatedMinutes,
  actualMinutes,
  nextActionText
}: ActionCompletionModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  const timeDifference = actualMinutes - estimatedMinutes
  const isEarly = timeDifference < 0
  const isOnTime = Math.abs(timeDifference) <= 1
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Mark Action Complete?</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p className="text-gray-700">
                Are you ready to mark this action as complete?
              </p>
              
              {/* Action details */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="font-medium text-gray-800 text-sm">
                  {actionText}
                </div>
                
                {/* Time comparison */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estimated:</span>
                  <span className="font-medium">{estimatedMinutes}m</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Actual time:</span>
                  <span className="font-medium">{actualMinutes}m</span>
                </div>
                
                {/* Time difference indicator */}
                {!isOnTime && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    isEarly ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {isEarly ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>
                      {isEarly 
                        ? `Finished ${Math.abs(timeDifference)}m early! Great focus!` 
                        : `Took ${timeDifference}m longer than estimated`
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* Next action preview */}
              {nextActionText && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-blue-800 font-medium text-sm mb-1">
                    Next Action:
                  </div>
                  <div className="text-blue-700 text-sm">
                    {nextActionText}
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isConfirming}>
            Continue Working
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-200"
          >
            {isConfirming ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Marking Complete...</span>
              </div>
            ) : (
              'Mark Complete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}