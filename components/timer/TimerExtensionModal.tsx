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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TimerExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (minutes: number) => void;
  onComplete?: () => void;
  actionText?: string;
  currentExtensions?: number[];
}

export function TimerExtensionModal({
  isOpen,
  onClose,
  onExtend,
  onComplete,
  actionText,
  currentExtensions = []
}: TimerExtensionModalProps) {
  const [customMinutes, setCustomMinutes] = useState('')
  const [isExtending, setIsExtending] = useState(false)

  const presetOptions = [5, 10, 15]
  const totalExtensions = currentExtensions.reduce((sum, ext) => sum + ext, 0)

  const handlePresetExtend = async (minutes: number) => {
    setIsExtending(true)
    try {
      await onExtend(minutes)
      onClose()
    } finally {
      setIsExtending(false)
    }
  }

  const handleCustomExtend = async () => {
    const minutes = parseInt(customMinutes)
    if (isNaN(minutes) || minutes <= 0 || minutes > 60) {
      return
    }
    
    setIsExtending(true)
    try {
      await onExtend(minutes)
      onClose()
      setCustomMinutes('')
    } finally {
      setIsExtending(false)
    }
  }

  const handleClose = () => {
    setCustomMinutes('')
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>Add More Time</span>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-gray-700">
                Need more time to complete this action? Choose how much time to add.
              </p>
              
              {/* Current action */}
              {actionText && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-800 text-sm mb-1">
                    Current Action:
                  </div>
                  <div className="text-gray-700 text-sm">
                    {actionText}
                  </div>
                </div>
              )}

              {/* Extension history */}
              {currentExtensions.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-orange-800 font-medium text-sm mb-1">
                    Previous Extensions:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentExtensions.map((ext, index) => (
                      <span key={index} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
                        +{ext}m
                      </span>
                    ))}
                  </div>
                  <div className="text-orange-700 text-sm mt-1">
                    Total added: {totalExtensions} minutes
                  </div>
                </div>
              )}

              {/* Preset options */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quick Options:
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {presetOptions.map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => handlePresetExtend(minutes)}
                      disabled={isExtending}
                      className="
                        px-4 py-3 text-sm font-medium rounded-lg border border-gray-300
                        hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700
                        focus:outline-none focus:ring-2 focus:ring-orange-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-200
                      "
                    >
                      +{minutes}m
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <Label htmlFor="custom-minutes" className="text-sm font-medium text-gray-700 mb-2 block">
                  Custom Amount (1-60 minutes):
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="custom-minutes"
                    type="number"
                    min="1"
                    max="60"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Enter minutes"
                    className="flex-1"
                    disabled={isExtending}
                  />
                  <button
                    onClick={handleCustomExtend}
                    disabled={isExtending || !customMinutes || parseInt(customMinutes) <= 0 || parseInt(customMinutes) > 60}
                    className="
                      px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg
                      hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors duration-200
                    "
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isExtending}>
            Continue Working
          </AlertDialogCancel>
          {onComplete && (
            <AlertDialogAction 
              onClick={onComplete}
              disabled={isExtending}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-200"
            >
              Complete Action
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}