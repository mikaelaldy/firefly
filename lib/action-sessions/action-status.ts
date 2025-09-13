'use client'

import type { EditableAction, SessionCompletionStats } from '@/types'

/**
 * Action status management utilities
 * Handles status transitions, validation, and completion logic
 */

/**
 * Valid status transitions for actions
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  'pending': ['active', 'skipped'],
  'active': ['completed', 'skipped', 'pending'],
  'completed': ['active', 'pending'], // Allow reactivation
  'skipped': ['active', 'pending'] // Allow reactivation
}

/**
 * Validate if a status transition is allowed
 */
export function isValidStatusTransition(
  currentStatus: EditableAction['status'], 
  newStatus: EditableAction['status']
): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false
}

/**
 * Update action status with validation and timestamps
 */
export function updateActionStatus(
  action: EditableAction,
  newStatus: EditableAction['status'],
  actualMinutes?: number
): EditableAction {
  // Validate transition
  if (!isValidStatusTransition(action.status, newStatus)) {
    throw new Error(`Invalid status transition from ${action.status} to ${newStatus}`)
  }

  const now = new Date()
  const updatedAction: EditableAction = {
    ...action,
    status: newStatus
  }

  // Handle status-specific updates
  switch (newStatus) {
    case 'completed':
      updatedAction.completedAt = now
      updatedAction.skippedAt = undefined
      if (actualMinutes !== undefined) {
        updatedAction.actualMinutes = actualMinutes
      }
      break

    case 'skipped':
      updatedAction.skippedAt = now
      updatedAction.completedAt = undefined
      // Keep actualMinutes if any time was spent before skipping
      break

    case 'active':
    case 'pending':
      // Clear completion/skip timestamps when reactivating
      updatedAction.completedAt = undefined
      updatedAction.skippedAt = undefined
      break
  }

  return updatedAction
}

/**
 * Mark action as completed
 */
export function completeAction(action: EditableAction, actualMinutes: number): EditableAction {
  return updateActionStatus(action, 'completed', actualMinutes)
}

/**
 * Mark action as skipped
 */
export function skipAction(action: EditableAction): EditableAction {
  return updateActionStatus(action, 'skipped')
}

/**
 * Reactivate a completed or skipped action
 */
export function reactivateAction(action: EditableAction): EditableAction {
  if (action.status === 'completed' || action.status === 'skipped') {
    return updateActionStatus(action, 'pending')
  }
  return action
}

/**
 * Set action as active (currently being worked on)
 */
export function activateAction(action: EditableAction): EditableAction {
  if (action.status === 'pending') {
    return updateActionStatus(action, 'active')
  }
  return action
}

/**
 * Calculate session completion statistics
 */
export function calculateSessionStats(actions: EditableAction[]): SessionCompletionStats {
  const totalActions = actions.length
  const completedActions = actions.filter(a => a.status === 'completed').length
  const skippedActions = actions.filter(a => a.status === 'skipped').length
  const pendingActions = actions.filter(a => a.status === 'pending' || a.status === 'active').length

  const completionRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0

  const totalEstimatedTime = actions.reduce((sum, action) => sum + (action.estimatedMinutes || 0), 0)
  const totalActualTime = actions.reduce((sum, action) => {
    if (action.status === 'completed' && action.actualMinutes) {
      return sum + action.actualMinutes
    }
    return sum
  }, 0)

  const timeVariance = totalEstimatedTime > 0 
    ? ((totalActualTime - totalEstimatedTime) / totalEstimatedTime) * 100 
    : 0

  // Calculate average accuracy for completed actions
  const completedActionsWithTime = actions.filter(a => 
    a.status === 'completed' && 
    a.actualMinutes !== undefined && 
    a.estimatedMinutes !== undefined &&
    a.estimatedMinutes > 0
  )

  const averageActionAccuracy = completedActionsWithTime.length > 0
    ? completedActionsWithTime.reduce((sum, action) => {
        const accuracy = Math.abs(1 - (action.actualMinutes! / action.estimatedMinutes!)) * 100
        return sum + (100 - accuracy) // Convert to positive accuracy percentage
      }, 0) / completedActionsWithTime.length
    : 0

  return {
    totalActions,
    completedActions,
    skippedActions,
    pendingActions,
    completionRate,
    totalEstimatedTime,
    totalActualTime,
    timeVariance,
    averageActionAccuracy
  }
}

/**
 * Check if all actions in a session are completed or skipped
 */
export function isSessionComplete(actions: EditableAction[]): boolean {
  return actions.length > 0 && actions.every(action => 
    action.status === 'completed' || action.status === 'skipped'
  )
}

/**
 * Get the next pending action in a session
 */
export function getNextPendingAction(actions: EditableAction[]): EditableAction | null {
  return actions.find(action => action.status === 'pending') || null
}

/**
 * Get the current active action in a session
 */
export function getCurrentActiveAction(actions: EditableAction[]): EditableAction | null {
  return actions.find(action => action.status === 'active') || null
}

/**
 * Generate session summary message based on completion stats
 */
export function generateSessionSummary(stats: SessionCompletionStats): {
  title: string;
  message: string;
  type: 'success' | 'partial' | 'incomplete';
} {
  const { completionRate, completedActions, totalActions, skippedActions } = stats

  if (completionRate === 100) {
    return {
      title: '🎉 Amazing Focus Session!',
      message: `You completed all ${totalActions} actions! That's the kind of momentum that builds great habits.`,
      type: 'success'
    }
  }

  if (completionRate >= 70) {
    return {
      title: '✨ Great Progress!',
      message: `You completed ${completedActions} out of ${totalActions} actions (${Math.round(completionRate)}%). That's solid progress!`,
      type: 'partial'
    }
  }

  if (completedActions > 0) {
    return {
      title: '👍 Good Start!',
      message: `You completed ${completedActions} action${completedActions === 1 ? '' : 's'}. Every step forward counts!`,
      type: 'partial'
    }
  }

  return {
    title: '💪 Ready for Next Time',
    message: `No actions completed this session, but showing up is half the battle. You've got this!`,
    type: 'incomplete'
  }
}

/**
 * Add time extension to an action
 */
export function addTimeExtension(action: EditableAction, extensionMinutes: number): EditableAction {
  const currentExtensions = action.timeExtensions || []
  return {
    ...action,
    timeExtensions: [...currentExtensions, extensionMinutes]
  }
}

/**
 * Get total time extensions for an action
 */
export function getTotalExtensions(action: EditableAction): number {
  return (action.timeExtensions || []).reduce((sum, ext) => sum + ext, 0)
}

/**
 * Get effective duration for an action (estimated + extensions)
 */
export function getEffectiveDuration(action: EditableAction): number {
  const base = action.estimatedMinutes || 0
  const extensions = getTotalExtensions(action)
  return base + extensions
}