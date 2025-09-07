# Timer Architecture

## Overview

The Firefly timer system is designed with a dual-component architecture that provides both regular timer functionality and enhanced action-based timer functionality. This separation ensures clean code organization while supporting the V1 Enhanced Next Actions Management feature.

## Component Architecture

### Timer Component (Main Entry Point)

The main `Timer` component acts as a smart router that determines which timer implementation to use based on the presence of actions:

```typescript
export function Timer({ goal, taskId, actions = [], onSessionComplete }: TimerProps) {
  // Use ActionTimer when we have actions, otherwise use regular timer
  if (actions.length > 0) {
    return (
      <ActionTimer 
        goal={goal}
        taskId={taskId}
        actions={actions}
        onSessionComplete={onSessionComplete}
      />
    )
  }

  // Regular timer implementation for when no actions are provided
  return <RegularTimer goal={goal} taskId={taskId} onSessionComplete={onSessionComplete} />
}
```

### RegularTimer Component

The `RegularTimer` component handles basic timer functionality without action tracking:

**Features:**
- Standard timer presets (25, 45, 50 minutes)
- Visual countdown with shrinking disc
- Pause/resume/stop controls
- Session variance tracking
- Keyboard shortcuts (Space for pause/resume, Escape for stop)
- Automatic session saving to database

**State Management:**
- `TimerState`: Tracks active status, pause state, duration, and remaining time
- `showLauncher`: Controls display of timer preset selection
- `currentAction`: Optional action context (usually null for regular timer)
- Drift correction using `pausedTimeRef` and `pauseStartRef`

### ActionTimer Component

The `ActionTimer` component extends timer functionality with action session management:

**Additional Features:**
- Action session initialization and tracking
- Current action display with time estimates
- Session progress indicator showing completed actions
- Real-time progress updates to dashboard
- Action completion marking when timer finishes
- Integration with action session context

**Enhanced State Management:**
- All RegularTimer state plus:
- `sessionStartTime`: Tracks overall session duration
- `actionStartTimeRef`: Tracks time spent on current action
- Integration with `useActionSession` context for persistent state

## Key Design Decisions

### 1. Component Separation

**Why separate RegularTimer and ActionTimer?**
- **Hooks Rules**: React hooks must be called consistently. By separating components, we avoid conditional hook calls
- **Code Clarity**: Each component has a single responsibility
- **Performance**: Regular timer users don't load action-related code
- **Maintainability**: Changes to action features don't affect basic timer functionality

### 2. Smart Router Pattern

**Why use Timer as a router component?**
- **Single Import**: Other components only need to import `Timer`
- **Backward Compatibility**: Existing code continues to work without changes
- **Progressive Enhancement**: Actions are an optional enhancement to basic timer functionality

### 3. Shared Utilities

Both timer components share common utilities:
- `calculateVariance`: Compares planned vs actual time
- `minutesToSeconds`: Converts duration formats
- `calculateAdjustedElapsed`: Handles drift correction for paused timers
- `saveSession`: Persists session data to database

## Usage Patterns

### Basic Timer Usage

```typescript
// No actions - uses RegularTimer
<Timer 
  goal="Write documentation"
  onSessionComplete={handleComplete}
/>
```

### Enhanced Timer with Actions

```typescript
// With actions - uses ActionTimer
<Timer 
  goal="Complete project setup"
  actions={editableActions}
  onSessionComplete={handleComplete}
/>
```

## Session Flow

### Regular Timer Flow
1. User selects preset duration (25/45/50 minutes)
2. Timer starts with visual countdown
3. User can pause/resume/stop
4. On completion: variance calculated, session saved, navigate to results

### Action Timer Flow
1. Action session initialized with goal and actions
2. User selects action with estimated duration
3. Timer starts with action context displayed
4. Progress tracked in real-time
5. On completion: action marked complete, session progress updated
6. Session data synced to dashboard

## Error Handling

Both timer components implement robust error handling:

- **Database Failures**: Sessions save to localStorage as fallback
- **Network Issues**: Timer continues to function offline
- **State Corruption**: Timer resets gracefully on errors
- **Browser Tab Switching**: Drift correction maintains accuracy

## Performance Considerations

- **Lazy Loading**: ActionTimer only loads when needed
- **Efficient Updates**: Timer updates every 1 second, progress updates every 30 seconds
- **Memory Management**: Intervals cleared on component unmount
- **Drift Correction**: Prevents timer inaccuracy during browser tab switching or system sleep

## Testing Strategy

### Unit Tests
- Timer utility functions (variance calculation, time conversion)
- Drift correction algorithms
- Session data formatting

### Integration Tests
- Timer start/pause/resume/stop flows
- Action session integration
- Database persistence
- Navigation after completion

### Manual QA
- Timer accuracy over extended periods
- Browser tab switching behavior
- System sleep/wake handling
- Keyboard shortcut functionality

## Future Enhancements

The architecture supports future enhancements:

- **Multiple Action Selection**: Timer could work on multiple actions in sequence
- **Smart Duration Adjustment**: AI could adjust timer duration based on progress
- **Break Reminders**: Automatic break suggestions between actions
- **Team Sessions**: Collaborative timer sessions with shared actions

## Migration Notes

### From Previous Architecture

The refactoring maintains full backward compatibility:
- All existing `Timer` component usage continues to work
- Props interface remains unchanged
- Session data format is consistent
- Navigation patterns are preserved

### Breaking Changes

None. This is a pure refactoring that improves code organization without changing external APIs.