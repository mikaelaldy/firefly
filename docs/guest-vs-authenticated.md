# Guest vs Authenticated User System

## Overview

Firefly now has a clear separation between guest users and authenticated users, with different data storage strategies for each.

## Guest Mode (No Login Required)

### Data Storage
- **Location**: Browser localStorage only
- **Persistence**: Data stays on the current device/browser
- **Sync**: No cross-device sync
- **Privacy**: Data never leaves the user's device

### Features Available
- ✅ Full timer functionality
- ✅ AI-powered task suggestions
- ✅ Session completion tracking
- ✅ Action session management
- ✅ All core ADHD focus features
- ❌ Cross-device sync
- ❌ Dashboard history
- ❌ Long-term analytics

### Storage Keys
- `firefly_guest_sessions`: Action sessions created in guest mode
- `firefly_guest_actions`: Individual actions within guest sessions

## Authenticated Mode (Login Required)

### Data Storage
- **Location**: Supabase database
- **Persistence**: Permanent cloud storage
- **Sync**: Available across all devices
- **Privacy**: Protected by Row Level Security (RLS)

### Features Available
- ✅ All guest mode features
- ✅ Cross-device sync
- ✅ Dashboard with analytics
- ✅ Session history
- ✅ Personal records tracking
- ✅ Progress insights
- ✅ Long-term data retention

### Database Tables
- `action_sessions`: User's action sessions
- `editable_actions`: Individual actions within sessions
- `sessions`: Timer session history (legacy)

## User Experience

### Visual Indicators
- **Navbar**: Shows "Guest mode" or "Logged in" status
- **Task Input**: Indicates where sessions will be stored
- **Session Results**: Shows whether session was saved to dashboard

### Transition from Guest to Authenticated
- Guest data remains in localStorage
- New authenticated sessions go to database
- No automatic migration (by design for privacy)
- Users can manually recreate important sessions if needed

## Technical Implementation

### Service Layer
The `action-sessions.ts` service automatically detects user authentication status:

```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  // Guest mode: use localStorage
  // Save to firefly_guest_sessions and firefly_guest_actions
} else {
  // Authenticated mode: use Supabase
  // Save to action_sessions and editable_actions tables
}
```

### No Offline Sync
- **Removed**: Complex offline sync system
- **Simplified**: Clear guest vs authenticated separation
- **Reliable**: No sync conflicts or data loss scenarios
- **Predictable**: Users know exactly where their data is stored

## Benefits

### For Users
- **Clear expectations**: Know exactly where data is stored
- **Privacy control**: Guest mode keeps data local
- **Simple onboarding**: Can try app without account
- **Reliable sync**: Authenticated users get guaranteed cloud storage

### For Developers
- **Simplified codebase**: No complex sync logic
- **Easier debugging**: Clear data flow paths
- **Better reliability**: No sync failure scenarios
- **Cleaner architecture**: Separation of concerns

## Migration from Offline Sync

### Removed Components
- `OfflineSyncProvider`
- `useOfflineSync` hook
- Sync status indicators
- Pending sync operations

### Updated Functions
- `createActionSession()`: Now returns `isGuest` instead of `isOffline`
- `markActionCompleted()`: Simplified to guest/authenticated paths
- `updateSessionProgress()`: No sync queuing
- `getUserActionSessions()`: Clear data source separation

### Cleanup Functions
- `clearGuestData()`: Clear localStorage guest data
- `getGuestSessionsCount()`: Count guest sessions