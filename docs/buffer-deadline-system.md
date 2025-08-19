# Buffer & Deadline Management System

## Overview

The Firefly app includes intelligent deadline detection and buffer management to help users with ADHD better estimate and manage time-sensitive tasks.

## Core Concepts

### Deadline Detection
The system automatically identifies when tasks have approaching deadlines and suggests appropriate time buffers.

```typescript
interface DeadlineInfo {
  dueDate: Date;           // When the task is due
  timeUntilDue: number;    // Minutes remaining until deadline
  isSoon: boolean;         // True if deadline is within 2 hours
  suggestedBuffer: number; // Recommended buffer percentage (default 25%)
}
```

**Key Features:**
- Automatically detects deadlines within 2 hours
- Suggests 25% time buffer for urgent tasks
- Integrates with AI suggestions for better time estimates

### If-Then Planning
Simple contingency planning helps users prepare for common ADHD challenges like procrastination or getting distracted.

```typescript
interface IfThenPlan {
  condition: string; // "If it's 9 AM and not started"
  action: string;    // "warm-up for 10m"
}
```

**Example Plans:**
- "If it's 9 AM and not started" → "warm-up for 10m"
- "If I get distracted" → "take 2-minute break, then restart"
- "If I'm feeling overwhelmed" → "break task into 5-minute chunks"

### Visual Timeline
Non-interactive timeline showing key checkpoints and deadlines to help with time awareness.

```typescript
interface TimelineCheckpoint {
  time: Date;
  label: string;
  type: 'start' | 'checkpoint' | 'buffer' | 'deadline';
  isAutoSuggested?: boolean;
}
```

**Checkpoint Types:**
- **start**: When to begin the task
- **checkpoint**: Progress milestones
- **buffer**: Recommended buffer time
- **deadline**: Final due date

## Implementation Status

This feature is part of **Task 11** in the implementation plan:

- ✅ **Type Definitions**: Core interfaces defined
- ⏳ **Buffer Detection**: Visual-only buffer suggestions
- ⏳ **If-Then Planning**: Simple input for contingency plans
- ⏳ **Timeline Visualization**: Non-interactive timeline ladder

## Usage Examples

### Deadline Detection
```typescript
const deadlineInfo: DeadlineInfo = {
  dueDate: new Date('2024-01-15T17:00:00'),
  timeUntilDue: 90, // 1.5 hours
  isSoon: true,     // Within 2 hours
  suggestedBuffer: 25 // Recommend 25% extra time
};
```

### Creating If-Then Plans
```typescript
const contingencyPlan: IfThenPlan = {
  condition: "If I haven't started by 3 PM",
  action: "Set a 5-minute warm-up timer to just begin"
};
```

### Timeline Visualization
```typescript
const timeline: TimelineCheckpoint[] = [
  {
    time: new Date('2024-01-15T15:00:00'),
    label: "Start working",
    type: 'start'
  },
  {
    time: new Date('2024-01-15T16:15:00'),
    label: "Buffer time begins",
    type: 'buffer',
    isAutoSuggested: true
  },
  {
    time: new Date('2024-01-15T17:00:00'),
    label: "Final deadline",
    type: 'deadline'
  }
];
```

## Design Principles

### Visual-Only Approach
The buffer and deadline system is intentionally **visual-only** to avoid overwhelming users with complex scheduling features. The focus is on awareness, not automation.

### Non-Blocking Implementation
Buffer suggestions and timeline visualizations never block the core timer functionality. Users can always start a timer immediately regardless of deadline status.

### ADHD-Friendly Features
- **Time Awareness**: Visual cues for approaching deadlines
- **Contingency Planning**: Prepare for common challenges
- **Gentle Suggestions**: Recommendations, not requirements
- **Progressive Enhancement**: Works without deadline information

## Integration Points

### AI Suggestions
The AI system considers deadline information when generating task suggestions:
```typescript
interface SuggestResponse {
  firstStep: { description: string; estimatedSeconds: number };
  nextActions: string[];
  bufferRecommendation?: number; // Integrates with DeadlineInfo
}
```

### User Preferences
Buffer percentage can be customized in user preferences:
```typescript
interface UserPreferences {
  bufferPercentage: number; // Default 25%
  // ... other preferences
}
```

### Timer Integration
The timer system respects buffer recommendations but never enforces them, maintaining the app's core principle of immediate usability.

## Future Enhancements

While keeping the MVP scope minimal, potential future improvements include:

- **Smart Buffer Calculation**: ML-based buffer suggestions based on user history
- **Deadline Notifications**: Gentle reminders for approaching deadlines
- **Calendar Integration**: Import deadlines from external calendars
- **Variance Learning**: Adjust buffer suggestions based on user's actual completion patterns

## Requirements Satisfied

- **5.1**: Buffer suggestions for tasks due soon
- **5.2**: If-Then planning input (non-blocking)
- **5.3**: Visual timeline with checkpoints
- **5.5**: Integration with existing timer and AI syste