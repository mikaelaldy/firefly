# V1 Enhanced Actions - Type Reference

## Overview

This document provides a comprehensive reference for the TypeScript types introduced in the V1 Enhanced Next Actions Management feature. These types ensure type safety across the client-side state management and API interactions.

## Core Types

### EditableAction

Represents an individual action item that users can edit, delete, and get time estimates for.

```typescript
export interface EditableAction {
  id: string;                    // Unique identifier for the action
  text: string;                  // Action description (user-editable)
  estimatedMinutes?: number;     // AI-generated time estimate
  confidence?: 'low' | 'medium' | 'high'; // AI confidence level
  isCustom: boolean;             // True if user modified from original
  originalText?: string;         // Original AI-generated text for tracking
}
```

**Usage Examples:**
```typescript
// AI-generated action
const aiAction: EditableAction = {
  id: 'action-1',
  text: 'Review existing documentation',
  estimatedMinutes: 25,
  confidence: 'high',
  isCustom: false,
  originalText: 'Review existing documentation'
};

// User-modified action
const customAction: EditableAction = {
  id: 'action-2',
  text: 'Write detailed introduction with examples',
  estimatedMinutes: 35,
  confidence: 'medium',
  isCustom: true,
  originalText: 'Write introduction section'
};
```

### ActionSession

Represents a complete action session containing multiple actions and tracking overall progress.

```typescript
export interface ActionSession {
  sessionId: string;             // Unique session identifier
  goal: string;                  // User's main goal for this session
  actions: EditableAction[];     // Array of actions in this session
  completedActions: string[];    // IDs of completed actions
  currentActionId?: string;      // Currently active action (optional)
  totalEstimatedTime: number;    // Sum of all action estimates (minutes)
  actualTimeSpent: number;       // Actual time spent on session (minutes)
  createdAt: Date;              // Session creation timestamp
  updatedAt: Date;              // Last update timestamp
}
```

**Usage Examples:**
```typescript
// New action session
const newSession: ActionSession = {
  sessionId: 'session-123',
  goal: 'Complete project documentation',
  actions: [aiAction, customAction],
  completedActions: [],
  totalEstimatedTime: 60,
  actualTimeSpent: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Session with progress
const activeSession: ActionSession = {
  ...newSession,
  completedActions: ['action-1'],
  currentActionId: 'action-2',
  actualTimeSpent: 28,
  updatedAt: new Date()
};
```

## API Types

### EstimateRequest

Request payload for the AI time estimation endpoint.

```typescript
export interface EstimateRequest {
  actions: string[];             // Array of action descriptions
  context?: string;              // Optional context for better estimates
}
```

### EstimateResponse

Response from the AI time estimation endpoint.

```typescript
export interface EstimateResponse {
  estimatedActions: {
    action: string;              // Action description
    estimatedMinutes: number;    // Estimated time in minutes
    confidence: 'low' | 'medium' | 'high'; // Confidence level
  }[];
  totalEstimatedTime: number;    // Sum of all estimates
}
```

## State Management Patterns

### Client-Side State

```typescript
// React state for managing editable actions
const [actionSession, setActionSession] = useState<ActionSession | null>(null);
const [isEstimating, setIsEstimating] = useState(false);

// Update action text
const updateActionText = (actionId: string, newText: string) => {
  setActionSession(prev => {
    if (!prev) return null;
    return {
      ...prev,
      actions: prev.actions.map(action => 
        action.id === actionId 
          ? { ...action, text: newText, isCustom: true }
          : action
      ),
      updatedAt: new Date()
    };
  });
};
```

### API Integration

```typescript
// Call AI estimation endpoint
const getTimeEstimates = async (actions: EditableAction[]): Promise<EstimateResponse> => {
  const request: EstimateRequest = {
    actions: actions.map(a => a.text),
    context: actionSession?.goal
  };
  
  const response = await fetch('/api/ai/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  return response.json();
};
```

## Database Integration

The types align with the database schema defined in `supabase/migrations/003_action_sessions_schema.sql`:

- `ActionSession` maps to the `action_sessions` table
- `EditableAction` maps to the `editable_actions` table
- Type safety ensures consistent data flow from database to UI

## Migration Notes

When upgrading from the base version to V1:

1. Import the new types: `import { EditableAction, ActionSession } from '@/types'`
2. Update existing components to use the new interfaces
3. Ensure database migration 003 is applied
4. Test type compatibility with existing API endpoints

## Best Practices

### Type Guards

```typescript
// Type guard for EditableAction
const isEditableAction = (obj: any): obj is EditableAction => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    typeof obj.isCustom === 'boolean';
};

// Type guard for ActionSession
const isActionSession = (obj: any): obj is ActionSession => {
  return obj &&
    typeof obj.sessionId === 'string' &&
    typeof obj.goal === 'string' &&
    Array.isArray(obj.actions) &&
    Array.isArray(obj.completedActions);
};
```

### Error Handling

```typescript
// Safe action updates with type checking
const safeUpdateAction = (session: ActionSession, actionId: string, updates: Partial<EditableAction>) => {
  const actionIndex = session.actions.findIndex(a => a.id === actionId);
  if (actionIndex === -1) {
    throw new Error(`Action with id ${actionId} not found`);
  }
  
  const updatedAction = { ...session.actions[actionIndex], ...updates };
  if (!isEditableAction(updatedAction)) {
    throw new Error('Invalid action data after update');
  }
  
  return {
    ...session,
    actions: session.actions.map((action, index) => 
      index === actionIndex ? updatedAction : action
    ),
    updatedAt: new Date()
  };
};
```

## Related Documentation

- [Enhanced Next Actions Management](./enhanced-next-actions.md) - Feature overview and user experience
- [Database Schema](../supabase/migrations/README_003_action_sessions.md) - Database structure and RLS policies
- [API Reference](./api-performance.md) - Performance considerations for V1 endpoints