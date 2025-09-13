# Enhanced Next Actions Management (V1 Feature)

## Overview

The Enhanced Next Actions Management feature allows users to edit, customize, and get AI-powered time estimates for their action items. This addresses the ADHD need for personalized workflows and realistic time planning.

## Key Components

### TypeScript Interfaces

The feature introduces new type definitions in `types/index.ts`:

```typescript
// Enhanced Next Actions types (V1 Feature)
export interface EditableAction {
  id: string;
  text: string;
  estimatedMinutes?: number;
  confidence?: 'low' | 'medium' | 'high';
  isCustom: boolean; // true if user-modified
  originalText?: string; // for tracking changes
  status: 'pending' | 'active' | 'completed' | 'skipped';
  actualMinutes?: number;
  timeExtensions?: number[]; // array of added minutes
  completedAt?: Date;
  skippedAt?: Date;
}

export interface ActionSession {
  sessionId: string;
  goal: string;
  actions: EditableAction[];
  completedActions: string[];
  currentActionId?: string;
  totalEstimatedTime: number;
  actualTimeSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

// AI Time Estimation API types
export interface EstimateRequest {
  actions: string[];
  context?: string;
}

export interface EstimateResponse {
  estimatedActions: {
    action: string;
    estimatedMinutes: number;
    confidence: 'low' | 'medium' | 'high';
  }[];
  totalEstimatedTime: number;
}
```

### Database Schema

Two new tables support action session tracking:

**action_sessions**: Stores user action sessions with goals and time tracking
- `id`: Primary key (UUID)
- `user_id`: Foreign key to auth.users
- `goal`: User's main goal for this session
- `total_estimated_time`: Sum of all action estimates (minutes)
- `actual_time_spent`: Actual time spent on session (minutes)
- `status`: Session status (active, completed, paused)

**editable_actions**: Stores individual actions within sessions
- `id`: Primary key (UUID)
- `session_id`: Foreign key to action_sessions
- `text`: Action description (editable by user)
- `estimated_minutes`: AI-generated time estimate
- `confidence`: AI confidence level (low, medium, high)
- `is_custom`: True if user modified the action
- `original_text`: Original AI-generated text
- `order_index`: Display order within session
- `status`: Action status (pending, active, completed, skipped) - **Required in V1.1**
- `actual_minutes`: Time actually spent on action
- `time_extensions`: Array of extension amounts in minutes
- `completed_at`: Timestamp when action was completed
- `skipped_at`: Timestamp when action was skipped

## User Experience Flow

### 1. Action Editing
- **Inline Editing**: Click any AI-generated action to edit text
- **Add Actions**: Users can add custom actions to the list
- **Delete Actions**: Remove unwanted actions with confirmation
- **Offline Support**: All editing works offline with automatic sync
- **Reordering**: Drag and drop to reorder actions (future enhancement)

### 2. AI Time Estimation
- **Trigger**: Click "Update with AI" button after editing actions
- **Processing**: Send modified actions to `/api/ai/estimate` endpoint
- **Results**: Display time estimates with confidence indicators
- **Fallback**: Default estimates if AI service unavailable
- **Offline Mode**: Cached estimates used when offline

### 3. Custom Timer Durations
- **Action Selection**: Choose specific action to work on
- **Custom Duration**: Timer uses AI-estimated time instead of presets
- **Progress Tracking**: Mark actions as completed during timer sessions
- **Offline Tracking**: Progress saved locally and synced when online
- **Session Sync**: Progress synced to dashboard in real-time

### 4. Offline-First Operation
- **Seamless Experience**: All action operations work without internet
- **Automatic Sync**: Data syncs automatically when connection restored
- **Progress Preservation**: No work lost due to network issues
- **Visual Feedback**: Subtle indicators show offline status when relevant

## API Endpoints

### `/api/ai/estimate`

**Purpose**: Generate realistic time estimates for ADHD users

**Request Example**:
```json
{
  "actions": [
    "Review existing documentation",
    "Write introduction section",
    "Create code examples"
  ],
  "context": "Technical documentation project"
}
```

**Response Example**:
```json
{
  "estimatedActions": [
    {
      "action": "Review existing documentation",
      "estimatedMinutes": 25,
      "confidence": "high"
    },
    {
      "action": "Write introduction section",
      "estimatedMinutes": 35,
      "confidence": "medium"
    },
    {
      "action": "Create code examples",
      "estimatedMinutes": 45,
      "confidence": "medium"
    }
  ],
  "totalEstimatedTime": 105
}
```

## ADHD-Specific Optimizations

### Time Estimation Considerations
- **Task Switching Buffer**: Extra time for transitions between actions
- **Hyperfocus Potential**: Accounts for getting absorbed in tasks
- **Distraction Buffer**: Realistic estimates that include interruption time
- **Confidence Levels**: Help users gauge estimate reliability

### User Interface Design
- **Immediate Feedback**: Changes save automatically without page reload
- **Visual Confirmation**: Clear indicators for editing mode and save states
- **Error Recovery**: Graceful handling of API failures with fallback estimates
- **Progressive Enhancement**: Core editing works without AI estimates

## Implementation Status

### Completed (✅)
- TypeScript interfaces for API contracts and client-side state management
- Database schema with RLS policies
- Migration scripts and verification tools
- Core type definitions for EditableAction and ActionSession
- **V1.1 Enhancement**: Required status field with completion/skip timestamps

### In Progress (🚧)
- EditableNextActions component development
- AI time estimation API endpoint
- Enhanced timer with custom durations

### Completed (✅)
- Action progress tracking during timer sessions
- Dashboard integration for action session history
- Comprehensive offline sync system for all action operations

### Planned (📋)
- Drag and drop action reordering
- Bulk action operations (select multiple, delete all)
- Action templates for common workflows

## Testing Strategy

### Manual QA Checklist
1. ✅ Edit action text inline and verify immediate save
2. ✅ Delete actions and confirm removal
3. ✅ Add custom actions to the list
4. ✅ Click "Update with AI" and verify time estimates appear
5. ✅ Select action with estimate and start custom timer
6. ✅ Complete timer session and verify action marked as done
7. ✅ Check dashboard shows action session data

### Database Testing
- Verify RLS policies prevent cross-user data access
- Test action session creation and updates
- Confirm cascade deletes work correctly
- Validate time tracking accuracy

## Security Considerations

### Data Privacy
- **RLS Policies**: Users can only access their own action sessions
- **Input Sanitization**: Action text validated before AI processing
- **PII Protection**: No personal identifiers sent to AI service

### API Security
- **Rate Limiting**: 5 estimation requests per minute per user
- **Input Validation**: Action array length and content validation
- **Authentication**: Requires valid user session for data persistence

## Performance Metrics

### Target Performance
- **Action Editing**: < 100ms response time for text changes
- **AI Estimation**: < 2 seconds for typical action lists
- **Timer Start**: < 1 second with custom duration
- **Database Sync**: < 500ms for session updates

### Monitoring
- Track AI estimation API response times
- Monitor action editing success rates
- Measure custom timer accuracy vs estimates
- Dashboard query performance for action data

## Future Enhancements

### Short Term
- Drag and drop action reordering
- Bulk action operations (select multiple, delete all)
- Action templates for common workflows

### Long Term
- Machine learning from user completion patterns
- Smart action suggestions based on goal analysis
- Team collaboration features for shared action lists
- Integration with external task management tools