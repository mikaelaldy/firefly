/**
 * Timer utility functions for the Firefly ADHD Focus App
 */

/**
 * Calculate variance percentage between planned and actual duration
 * @param plannedDuration - Planned duration in seconds
 * @param actualDuration - Actual duration in seconds
 * @returns Variance percentage (positive = over time, negative = under time)
 */
export function calculateVariance(plannedDuration: number, actualDuration: number): number {
  if (plannedDuration === 0) return 0
  
  const variance = ((actualDuration - plannedDuration) / plannedDuration) * 100
  return Math.round(variance * 100) / 100 // Round to 2 decimal places
}

/**
 * Format seconds into mm:ss format
 * @param seconds - Total seconds
 * @returns Formatted time string (mm:ss)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Convert minutes to seconds
 * @param minutes - Duration in minutes
 * @returns Duration in seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

/**
 * Get friendly variance message for user feedback
 * @param variance - Variance percentage
 * @param plannedMinutes - Original planned duration in minutes
 * @param actualMinutes - Actual duration in minutes
 * @returns User-friendly message
 */
export function getVarianceMessage(variance: number, plannedMinutes: number, actualMinutes: number): string {
  const absVariance = Math.abs(variance)
  
  if (absVariance < 5) {
    return `Perfect timing! You estimated ${plannedMinutes}m and finished in ${actualMinutes}m—excellent focus! 🎯`
  } else if (variance > 0) {
    return `You estimated ${plannedMinutes}m and finished in ${actualMinutes}m. Taking a bit longer shows deep focus! 💪`
  } else {
    return `You estimated ${plannedMinutes}m and finished in ${actualMinutes}m. Great efficiency! ⚡`
  }
}

/**
 * Calculate drift correction for timer resume
 * @param startTime - Original timer start time
 * @param totalPausedTime - Total time spent paused (in milliseconds)
 * @returns Adjusted elapsed time in seconds
 */
export function calculateAdjustedElapsed(startTime: Date, totalPausedTime: number): number {
  const now = Date.now()
  const totalElapsed = Math.floor((now - startTime.getTime()) / 1000)
  const adjustedElapsed = totalElapsed - Math.floor(totalPausedTime / 1000)
  return Math.max(0, adjustedElapsed)
}