# Offline Sync System

## Overview

The Firefly app includes a comprehensive offline sync system that ensures users can continue working even when their internet connection is unreliable or unavailable. This is particularly important for ADHD users who need consistent access to their focus tools without technical barriers.

## Key Features

### Automatic Offline Detection
- **Network Status Monitoring**: Continuously monitors `navigator.onLine` status
- **Graceful Degradation**: Seamlessly switches to offline mode when network is unavailable
- **Automatic Recovery**: Automatically syncs data when connection is restored

### Local Storage Management
The system uses three localStorage keys for offline data:

- `firefly_offline_sessions`: Stores action sessions created while offline
- `firefly_offline_actions`: Stores individual actions associated with offline sessions
- `firefly_pending_sync`: Queue of operations waiting to sync when online

### Offline-First Operations
All core operations work offline with automatic sync when reconnected:

- **Action Session Creation**: Create new sessions with full action lists
- **Action Completion**: Mark actions as completed during timer sessions
- **Session Progress Updates**: Track actual time spent and session status
- **Action Modifications**: Edit, add, or delete actions (future enhancement)

## Technical Implementation

### Data Structures

#### Offline Session
```typescript
interface OfflineSession extends ActionSessionData {
  offline_id: string;        // Unique offline identifier
  needs_sync: boolean;       // Flag for sync requirement
  sync_attempts: number;     // Track retry attempts
  last_sync_attempt?: string; // Timestamp of last sync try
}
```

#### Offline Action
```typescript
interface OfflineAction extends EditableActionData {
  offline_id: string;        // Unique offline identifier
  needs_sync: boolean;       // Flag for sync requirement
  sync_attempts: number;     // Track retry attempts
  last_sync_attempt?: string; // Timestamp of last sync try
}
```

#### Pending Sync Operation
```typescript
interface PendingSyncOperation {
  id: string;                // Operation identifier
  type: 'create_session' | 'update_session' | 'create_action' | 'update_action' | 'delete_action';
  data: any;                 // Operation payload
  timestamp: string;         // When operation was queued
  attempts: number;          // Retry count
}
```

### Core Functions

#### `createActionSession(goal, actions)`
- **Online**: Creates session in Supabase database
- **Offline**: Stores session locally with offline_id
- **Fallback**: Switches to offline mode on database errors
- **Returns**: Session ID (offline or database) and offline status

#### `markActionCompleted(actionId, actualMinutesSpent)`
- **Online**: Updates action in database with completion timestamp
- **Offline**: Updates local action data and queues sync operation
- **Fallback**: Gracefully handles database errors by going offline

#### `updateSessionProgress(sessionId, actualTimeSpent, status)`
- **Online**: Updates session progress in database
- **Offline**: Updates local session data and queues sync operation
- **Fallback**: Maintains progress tracking even during network issues

#### `syncOfflineData()`
- **Automatic**: Triggered when device comes online
- **Manual**: Can be called programmatically for forced sync
- **Chronological**: Processes operations in timestamp order
- **Error Handling**: Continues syncing even if individual operations fail

### Sync Strategy

#### Event-Driven Sync
```typescript
// Automatic sync on network events
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);
```

#### Retry Logic
- **Exponential Backoff**: Increases delay between retry attempts
- **Max Attempts**: Limits retry attempts to prevent infinite loops
- **Partial Success**: Continues syncing even if some operations fail

#### Data Integrity
- **Chronological Order**: Operations synced in creation timestamp order
- **Atomic Operations**: Each sync operation is independent
- **Conflict Resolution**: Offline data takes precedence for user modifications

## User Experience

### Seamless Operation
- **No Interruption**: Users can continue working without noticing network issues
- **Visual Feedback**: Subtle indicators show offline status when relevant
- **Progress Preservation**: All work is saved locally and synced later

### Status Indicators
- **Offline Badge**: Shows when app is operating in offline mode
- **Sync Progress**: Displays sync status when reconnecting
- **Pending Count**: Shows number of operations waiting to sync

### Error Handling
- **Graceful Failures**: Database errors don't break the user experience
- **Fallback Messages**: Clear communication about offline operation
- **Recovery Options**: Manual sync triggers for troubleshooting

## API Integration

### Enhanced Function Signatures
All action session functions now return offline status:

```typescript
// Example return types with offline support
interface ActionResult {
  success: boolean;
  error?: string;
  isOffline?: boolean;  // New: indicates offline operation
}

interface SessionResult {
  sessionId: string;
  error?: string;
  isOffline?: boolean;  // New: indicates offline operation
}
```

### Backward Compatibility
- **Existing Code**: Works without modification
- **Optional Fields**: Offline status is optional in return types
- **Progressive Enhancement**: Apps can check `isOffline` flag for enhanced UX

## Development Usage

### Initialize Offline Sync
```typescript
import { initializeOfflineSync } from '@/lib/supabase/action-sessions';

// In your app component
useEffect(() => {
  const cleanup = initializeOfflineSync();
  return cleanup; // Cleanup event listeners on unmount
}, []);
```

### Check Sync Status
```typescript
import { getPendingSyncCount } from '@/lib/supabase/action-sessions';

// Get number of operations waiting to sync
const pendingCount = getPendingSyncCount();
```

### Manual Sync Trigger
```typescript
import { syncOfflineData } from '@/lib/supabase/action-sessions';

// Manually trigger sync (useful for debugging)
const result = await syncOfflineData();
console.log(`Synced ${result.synced} operations`);
```

### Clear Offline Data
```typescript
import { clearOfflineData } from '@/lib/supabase/action-sessions';

// Clear all offline data (use with caution)
clearOfflineData();
```

## Testing Scenarios

### Manual Testing
1. **Go Offline**: Disconnect internet, create action session
2. **Work Offline**: Complete actions, update session progress
3. **Come Online**: Reconnect internet, verify automatic sync
4. **Check Data**: Confirm all offline work appears in dashboard

### Network Simulation
- **Slow Connection**: Test with throttled network speeds
- **Intermittent Connection**: Toggle network on/off during operations
- **Database Errors**: Simulate Supabase downtime scenarios

### Edge Cases
- **Browser Refresh**: Verify offline data persists across page reloads
- **Multiple Tabs**: Test behavior with multiple app instances
- **Storage Limits**: Handle localStorage quota exceeded scenarios

## Performance Considerations

### Storage Efficiency
- **Minimal Data**: Only essential fields stored offline
- **Cleanup**: Successful syncs remove data from localStorage
- **Size Limits**: Monitor localStorage usage to prevent quota issues

### Sync Performance
- **Batch Operations**: Group related operations for efficient sync
- **Background Sync**: Non-blocking sync operations
- **Rate Limiting**: Respect API limits during bulk sync

### Memory Management
- **Event Cleanup**: Proper removal of event listeners
- **Data Cleanup**: Clear synced data to prevent memory leaks
- **Error Boundaries**: Prevent sync errors from crashing the app

## Security Considerations

### Data Privacy
- **Local Storage**: Offline data stored in browser localStorage only
- **No Sensitive Data**: Personal identifiers not stored offline
- **User Isolation**: Offline data tied to browser session

### Sync Security
- **Authentication**: Sync operations require valid user session
- **Data Validation**: Server validates all synced data
- **Conflict Resolution**: User data takes precedence in conflicts

## Future Enhancements

### Short Term
- **Conflict Resolution UI**: Show users when sync conflicts occur
- **Sync Progress Indicator**: Visual feedback during sync operations
- **Selective Sync**: Allow users to choose what data to sync

### Long Term
- **Background Sync**: Use Service Workers for background synchronization
- **Compression**: Compress offline data to reduce storage usage
- **Encryption**: Encrypt sensitive offline data for additional security

## Troubleshooting

### Common Issues
- **Sync Failures**: Check network connection and authentication status
- **Storage Full**: Clear browser data or use `clearOfflineData()`
- **Duplicate Data**: Verify sync operations completed successfully

### Debug Tools
- **Console Logging**: Detailed logs for sync operations and errors
- **Storage Inspector**: Use browser dev tools to inspect localStorage
- **Network Tab**: Monitor API calls during sync operations

### Recovery Procedures
- **Manual Sync**: Call `syncOfflineData()` to force sync attempt
- **Clear and Restart**: Use `clearOfflineData()` and recreate sessions
- **Export Data**: Extract offline data before clearing (future feature)