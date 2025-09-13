# Action Sessions API Documentation

## Overview

The Action Sessions API provides comprehensive functionality for managing user action sessions with full offline support. This system allows users to create, edit, and track action-based focus sessions with automatic synchronization when online.

## Core Functions

### `createActionSession(goal, actions)`

Creates a new action session with associated editable actions.

**Parameters:**
- `goal: string` - The main goal for this session
- `actions: EditableAction[]` - Array of actions with time estimates

**Returns:**
```typescript
Promise<{
  sessionId: string;
  error?: string;
  isOffline?: boolean;
}>
```

**Behavior:**
- **Online + Authenticated**: Creates session in Supabase database
- **Offline or Unauthenticated**: Stores session locally with offline_id
- **Database Error**: Automatically falls back to offline mode
- **Network Error**: Gracefully handles with offline storage

**Example:**
```typescript
const actions = [
  { text: "Review requirements", estimatedMinutes: 15, confidence: "high" },
  { text: "Draft outline", estimatedMinutes: 30, confidence: "medium" }
];

const result = await createActionSession("Write project proposal", actions);
if (result.isOffline) {
  console.log("Working offline - will sync when online");
}
```

### `markActionCompleted(actionId, actualMinutesSpent)`

Marks an action as completed with actual time tracking.

**Parameters:**
- `actionId: string` - ID of the action to mark complete
- `actualMinutesSpent: number` - Actual time spent on the action

**Returns:**
```typescript
Promise<{
  success: boolean;
  error?: string;
  isOffline?: boolean;
}>
```

**Behavior:**
- **Online**: Updates action in database with completion timestamp
- **Offline**: Updates local action data and queues for sync
- **Database Error**: Falls back to offline mode with sync queue

**Example:**
```typescript
const result = await markActionCompleted(actionId, 18);
if (result.success && result.isOffline) {
  console.log("Action completed offline - queued for sync");
}
```

### `updateSessionProgress(sessionId, actualTimeSpent, status?)`

Updates session progress with actual time spent and optional status change.

**Parameters:**
- `sessionId: string` - ID of the session to update
- `actualTimeSpent: number` - Total actual time spent in minutes
- `status?: 'active' | 'completed' | 'paused'` - Optional status update

**Returns:**
```typescript
Promise<{
  success: boolean;
  error?: string;
  isOffline?: boolean;
}>
```

**Example:**
```typescript
const result = await updateSessionProgress(sessionId, 45, 'completed');
```

### `getUserActionSessions(limit?)`

Retrieves user's action sessions with hybrid online/offline data.

**Parameters:**
- `limit?: number` - Maximum number of sessions to return (default: 10)

**Returns:**
```typescript
Promise<{
  sessions: (ActionSessionData & { 
    actions: EditableActionData[]; 
    isOffline?: boolean 
  })[];
  error?: string;
}>
```

**Behavior:**
- Returns merged data from both offline and online sources
- Offline sessions marked with `isOffline: true`
- Sorted chronologically by creation date
- Works entirely offline if database unavailable

**Example:**
```typescript
const { sessions } = await getUserActionSessions(5);
sessions.forEach(session => {
  console.log(`${session.goal} - ${session.isOffline ? 'Offline' : 'Synced'}`);
});
```

### `getActionSession(sessionId)`

Retrieves a specific action session with its actions.

**Parameters:**
- `sessionId: string` - ID of the session to retrieve

**Returns:**
```typescript
Promise<{
  session: ActionSessionData | null;
  actions: EditableActionData[];
  error?: string;
}>
```

**Example:**
```typescript
const { session, actions } = await getActionSession(sessionId);
if (session) {
  console.log(`Session: ${session.goal} with ${actions.length} actions`);
}
```

## Offline Sync Functions

### `syncOfflineData()`

Manually triggers synchronization of offline data to the server.

**Returns:**
```typescript
Promise<{
  success: boolean;
  synced: number;
  errors: string[];
}>
```

**Behavior:**
- Processes pending operations in chronological order
- Continues syncing even if individual operations fail
- Clears successfully synced operations from local storage
- Returns detailed results for monitoring

**Example:**
```typescript
const result = await syncOfflineData();
console.log(`Synced ${result.synced} operations`);
if (result.errors.length > 0) {
  console.warn('Sync errors:', result.errors);
}
```

### `initializeOfflineSync()`

Sets up automatic offline sync event listeners.

**Returns:**
```typescript
() => void // Cleanup function
```

**Behavior:**
- Adds event listeners for online/offline events
- Automatically syncs when device comes online
- Performs initial sync if already online
- Returns cleanup function for component unmounting

**Example:**
```typescript
useEffect(() => {
  const cleanup = initializeOfflineSync();
  return cleanup; // Important: cleanup on unmount
}, []);
```

### `getPendingSyncCount()`

Returns the number of operations waiting to be synced.

**Returns:**
```typescript
number
```

**Example:**
```typescript
const pendingCount = getPendingSyncCount();
if (pendingCount > 0) {
  console.log(`${pendingCount} operations pending sync`);
}
```

### `clearOfflineData()`

Clears all offline data from localStorage. **Use with caution.**

**Returns:**
```typescript
void
```

**Warning:** This permanently deletes all offline data that hasn't been synced.

## Data Types

### ActionSessionData
```typescript
interface ActionSessionData {
  id?: string;
  user_id?: string;
  goal: string;
  total_estimated_time?: number;
  actual_time_spent?: number;
  status?: 'active' | 'completed' | 'paused';
  created_at?: string;
  updated_at?: string;
}
```

### EditableActionData
```typescript
interface EditableActionData {
  id?: string;
  session_id: string;
  text: string;
  estimated_minutes?: number;
  confidence?: 'low' | 'medium' | 'high';
  is_custom?: boolean;
  original_text?: string;
  order_index: number;
  completed_at?: string;
  created_at?: string;
}
```

## Error Handling

### Network Errors
All functions gracefully handle network errors by:
1. Falling back to offline mode
2. Storing data locally
3. Queuing operations for later sync
4. Returning success with `isOffline: true`

### Database Errors
Database connection issues are handled by:
1. Automatic fallback to offline storage
2. Queuing operations for retry
3. Maintaining user experience continuity
4. Logging errors for debugging

### Storage Errors
localStorage errors are handled by:
1. Warning logs (non-blocking)
2. Graceful degradation
3. Continued operation where possible

## Best Practices

### Error Handling
```typescript
const result = await createActionSession(goal, actions);
if (result.error && !result.isOffline) {
  // Handle actual errors
  console.error('Failed to create session:', result.error);
} else if (result.isOffline) {
  // Inform user of offline mode
  showNotification('Working offline - will sync when online');
}
```

### Sync Monitoring
```typescript
// Monitor sync status
const pendingCount = getPendingSyncCount();
if (pendingCount > 0) {
  // Show sync indicator
  setSyncStatus(`${pendingCount} items pending sync`);
}
```

### Cleanup
```typescript
// Always cleanup event listeners
useEffect(() => {
  const cleanup = initializeOfflineSync();
  return cleanup;
}, []);
```

## Integration Examples

### React Hook for Action Sessions
```typescript
function useActionSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      const { sessions } = await getUserActionSessions();
      setSessions(sessions);
      setLoading(false);
    };
    loadSessions();
  }, []);

  const createSession = async (goal, actions) => {
    const result = await createActionSession(goal, actions);
    if (result.sessionId) {
      // Refresh sessions list
      const { sessions } = await getUserActionSessions();
      setSessions(sessions);
    }
    return result;
  };

  return { sessions, loading, createSession };
}
```

### Sync Status Component
```typescript
function SyncStatus() {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setPendingCount(getPendingSyncCount());
    
    // Update count periodically
    const interval = setInterval(updateCount, 5000);
    updateCount(); // Initial update
    
    return () => clearInterval(interval);
  }, []);

  if (pendingCount === 0) return null;

  return (
    <div className="sync-status">
      {pendingCount} items pending sync
    </div>
  );
}
```

## Testing

### Manual Testing
1. **Create Session Offline**: Disconnect internet, create action session
2. **Complete Actions Offline**: Mark actions complete while offline
3. **Sync on Reconnect**: Reconnect internet, verify automatic sync
4. **Data Persistence**: Refresh browser, verify offline data persists
5. **Error Handling**: Simulate database errors, verify fallback behavior

### Automated Testing
See `lib/__tests__/action-sessions.test.ts` for comprehensive test suite covering:
- **Session Creation**: Guest mode and authenticated user workflows
- **Action Management**: Completion tracking with time variance calculations
- **Offline Functionality**: localStorage persistence and sync queue operations
- **Error Handling**: Database failures, network issues, and graceful fallbacks
- **Data Integrity**: Time estimation calculations and session progress tracking
- **Edge Cases**: Empty actions, invalid data, and browser compatibility scenarios

**Run Action Sessions Tests:**
```bash
# Run all tests including action sessions
bun run test

# Run only action sessions tests
bun run test lib/__tests__/action-sessions.test.ts

# Run V1 feature tests specifically
bun run test:v1
```

## Troubleshooting

### Common Issues
- **Sync Not Working**: Check network connection and authentication
- **Data Missing**: Verify localStorage isn't full or cleared
- **Duplicate Sessions**: Ensure sync completed successfully

### Debug Tools
- Browser dev tools → Application → Local Storage
- Console logs for sync operations
- Network tab for API call monitoring

### Recovery
- Manual sync: `await syncOfflineData()`
- Clear offline data: `clearOfflineData()` (loses unsynced data)
- Check pending operations: `getPendingSyncCount()`