# ActionSession Service Documentation

The ActionSession service provides comprehensive CRUD operations for managing action sessions with offline/online sync capabilities. This service is designed to work seamlessly whether the user is online or offline, ensuring data persistence and sync when connectivity is restored.

## Features

- ✅ **Offline-first design**: Works without internet connection
- ✅ **Automatic sync**: Syncs data when back online
- ✅ **Real-time updates**: Updates session progress in real-time
- ✅ **Error handling**: Graceful fallbacks for network issues
- ✅ **TypeScript support**: Fully typed interfaces
- ✅ **Row Level Security**: Secure data isolation per user

## Core Functions

### `createActionSession(goal, actions)`

Creates a new action session with associated actions.

```typescript
import { createActionSession } from '@/lib/supabase/action-sessions'
import type { EditableAction } from '@/types'

const actions: EditableAction[] = [
  {
    id: 'action-1',
    text: 'Write project documentation',
    estimatedMinutes: 30,
    confidence: 'high',
    isCustom: false
  },
  {
    id: 'action-2',
    text: 'Review code changes',
    estimatedMinutes: 15,
    confidence: 'medium',
    isCustom: false
  }
]

const result = await createActionSession('Complete project tasks', actions)

if (result.error) {
  console.error('Error creating session:', result.error)
} else {
  console.log('Session created:', result.sessionId)
  if (result.isOffline) {
    console.log('Session saved offline, will sync when online')
  }
}
```

### `markActionCompleted(actionId, actualMinutesSpent)`

Marks a specific action as completed with actual time spent.

```typescript
import { markActionCompleted } from '@/lib/supabase/action-sessions'

const result = await markActionCompleted('action-1', 25)

if (result.success) {
  console.log('Action marked as completed')
  if (result.isOffline) {
    console.log('Saved offline, will sync when online')
  }
} else {
  console.error('Error:', result.error)
}
```

### `updateSessionProgress(sessionId, actualTimeSpent, status?)`

Updates the session with actual time spent and optionally changes status.

```typescript
import { updateSessionProgress } from '@/lib/supabase/action-sessions'

const result = await updateSessionProgress('session-id', 45, 'completed')

if (result.success) {
  console.log('Session progress updated')
} else {
  console.error('Error:', result.error)
}
```

### `getUserActionSessions(limit?)`

Retrieves user's recent action sessions with actions.

```typescript
import { getUserActionSessions } from '@/lib/supabase/action-sessions'

const result = await getUserActionSessions(10)

if (result.error) {
  console.error('Error fetching sessions:', result.error)
} else {
  console.log('Found sessions:', result.sessions.length)
  result.sessions.forEach(session => {
    console.log(`Session: ${session.goal}`)
    console.log(`Actions: ${session.actions.length}`)
    console.log(`Offline: ${session.isOffline || false}`)
  })
}
```

## Using with React Context

The service is integrated with React Context for state management:

```typescript
import { useActionSession } from '@/lib/action-sessions/context'

function MyComponent() {
  const { 
    state, 
    startActionSession, 
    markActionAsCompleted, 
    updateTimeSpent,
    completeSession 
  } = useActionSession()

  const handleStartSession = async () => {
    const actions = [
      { id: '1', text: 'Task 1', estimatedMinutes: 20, isCustom: false }
    ]
    
    const sessionId = await startActionSession('My Goal', actions)
    if (sessionId) {
      console.log('Session started:', sessionId)
    }
  }

  const handleCompleteAction = async (actionId: string) => {
    await markActionAsCompleted(actionId, 18) // 18 minutes actual
  }

  return (
    <div>
      <h2>Session: {state.goal}</h2>
      <p>Progress: {state.completedActionIds.size}/{state.actions.length}</p>
      <p>Estimated: {state.totalEstimatedTime}m</p>
      <p>Actual: {state.actualTimeSpent}m</p>
      
      {state.actions.map(action => (
        <div key={action.id}>
          <span>{action.text}</span>
          <button onClick={() => handleCompleteAction(action.id)}>
            Complete
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Offline Sync Management

### Initialize Sync Listeners

```typescript
import { initializeOfflineSync } from '@/lib/supabase/action-sessions'

// In your app initialization
const cleanup = initializeOfflineSync()

// Call cleanup when app unmounts
// cleanup()
```

### Manual Sync

```typescript
import { syncOfflineData, getPendingSyncCount } from '@/lib/supabase/action-sessions'

// Check pending operations
const pendingCount = getPendingSyncCount()
console.log(`${pendingCount} operations pending sync`)

// Manual sync
const result = await syncOfflineData()
console.log(`Synced ${result.synced} operations`)
if (result.errors.length > 0) {
  console.error('Sync errors:', result.errors)
}
```

## Data Types

### ActionSessionData
```typescript
interface ActionSessionData {
  id?: string
  user_id?: string
  goal: string
  total_estimated_time?: number
  actual_time_spent?: number
  status?: 'active' | 'completed' | 'paused'
  created_at?: string
  updated_at?: string
}
```

### EditableActionData
```typescript
interface EditableActionData {
  id?: string
  session_id: string
  text: string
  estimated_minutes?: number
  confidence?: 'low' | 'medium' | 'high'
  is_custom?: boolean
  original_text?: string
  order_index: number
  completed_at?: string
  created_at?: string
}
```

## Error Handling

The service provides comprehensive error handling:

- **Network errors**: Automatically falls back to offline mode
- **Database errors**: Saves data locally and queues for sync
- **Authentication errors**: Continues working with local data
- **Validation errors**: Returns clear error messages

All functions return consistent response formats with success/error indicators and optional offline flags.

## Testing

The service includes comprehensive unit tests covering:

- Offline session creation
- Action completion tracking
- Session progress updates
- Data retrieval and filtering
- Offline sync operations

Run tests with:
```bash
bun run test lib/__tests__/action-sessions.test.ts
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **12.11**: Action session data persistence with user isolation
- **12.12**: Real-time progress tracking and dashboard integration
- **Offline/Online sync**: Seamless operation regardless of connectivity
- **Data integrity**: RLS policies ensure secure data access
- **Performance**: Optimized queries with proper indexing