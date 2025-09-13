/**
 * Clear offline sync data from localStorage
 * Run this in browser console to clear any leftover sync data
 */

console.log('Clearing offline sync data...')

// Clear all sync-related localStorage keys
const keysToRemove = [
  'firefly_offline_sessions',
  'firefly_offline_actions', 
  'firefly_pending_sync'
]

keysToRemove.forEach(key => {
  const data = localStorage.getItem(key)
  if (data) {
    console.log(`Removing ${key}:`, JSON.parse(data))
    localStorage.removeItem(key)
  } else {
    console.log(`${key}: not found`)
  }
})

console.log('Sync data cleared! Refresh the page.')