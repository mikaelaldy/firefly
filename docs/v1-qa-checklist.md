# V1 Features Manual QA Checklist

This checklist covers the complete V1 workflow testing as specified in task 23: "Test complete workflow: edit actions → get estimates → run timers → track progress"

## Prerequisites
- [ ] Application is running locally (`bun run dev`)
- [ ] Supabase is configured with action_sessions and editable_actions tables
- [ ] Google AI API key is configured for estimation endpoint
- [ ] User can authenticate with Google (optional for testing)

## Core V1 Workflow Testing

### 1. Action Editing Functionality (Requirements 12.1-12.5)

#### Initial Action Display
- [ ] AI-generated next actions are displayed with editable text fields
- [ ] Each action shows as clickable/editable
- [ ] Actions are numbered correctly (2, 3, 4, etc.)
- [ ] "Click to edit" hint is visible

#### Inline Editing
- [ ] Click on action text enters edit mode
- [ ] Input field appears with current text selected
- [ ] Save button (checkmark) and cancel button (X) are visible
- [ ] Press Enter to save changes
- [ ] Press Escape to cancel changes
- [ ] Click outside input field saves changes
- [ ] Empty text is rejected (reverts to original)

#### Action Management
- [ ] Delete button appears on hover for each action
- [ ] Delete confirmation dialog appears when clicking delete
- [ ] Deleted actions are removed from the list
- [ ] "Add Action" button creates new editable action
- [ ] New actions can be edited immediately
- [ ] Actions can be reordered using up/down arrows
- [ ] Custom actions are marked with "edited" badge

### 2. AI Time Estimation (Requirements 12.6-12.9)

#### Automatic Estimation
- [ ] "Update with AI" button is visible and enabled
- [ ] Auto-estimation occurs when component first loads (after 500ms delay)
- [ ] Loading state shows "Estimating..." with spinner
- [ ] Loading state shows encouraging message about AI analysis

#### Manual Re-estimation
- [ ] Click "Update with AI" triggers estimation for modified actions
- [ ] Loading spinner appears during API call
- [ ] Time estimates appear next to each action (e.g., "15m")
- [ ] Confidence levels are displayed (high/medium/low with colored badges)
- [ ] Total estimated time is calculated and displayed
- [ ] Estimates are reasonable (5-120 minutes per action)

#### Error Handling
- [ ] API failures show error message with dismiss option
- [ ] Network errors fall back gracefully
- [ ] Rate limiting is handled appropriately
- [ ] Fallback estimates are provided when AI fails

### 3. Custom Timer Durations (Requirement 12.10)

#### Timer Integration
- [ ] Timer launcher uses action estimates instead of presets
- [ ] User can select specific action to work on
- [ ] Timer duration matches selected action's estimate
- [ ] Current action context is displayed during timer
- [ ] Timer shows action name and estimated time

#### Timer Functionality
- [ ] Timer starts within 1 second of clicking "Start Focus"
- [ ] Visual countdown shows estimated duration
- [ ] Timer can be paused and resumed
- [ ] Timer can be stopped early
- [ ] Timer completion triggers action marking

### 4. Action Progress Tracking (Requirements 12.11-12.12)

#### Completion Tracking
- [ ] Actions are marked as completed when timer finishes
- [ ] Actual time spent is recorded vs estimated time
- [ ] Session progress updates in real-time
- [ ] Completed actions show completion timestamp
- [ ] Progress percentage is calculated correctly

#### Session Persistence
- [ ] Action modifications are saved to database/localStorage
- [ ] AI estimates are persisted with actions
- [ ] Session progress survives page refresh
- [ ] Offline mode queues changes for sync
- [ ] Online sync works when connection restored

### 5. Dashboard Integration (Requirement 12.12)

#### Session History
- [ ] Dashboard shows action session history
- [ ] Sessions display goal, estimated vs actual time
- [ ] Action details are visible in session history
- [ ] Time estimation accuracy is tracked
- [ ] Variance calculations are correct

#### Analytics
- [ ] Dashboard shows insights about estimation accuracy
- [ ] Progress metrics include action-based sessions
- [ ] Personal records account for custom durations
- [ ] Encouraging messages reference action completion

## Error Scenarios & Edge Cases

### Network & API Issues
- [ ] Offline mode works for action editing
- [ ] AI estimation failures don't block timer usage
- [ ] Database errors fall back to localStorage
- [ ] Sync queue works when back online
- [ ] Rate limiting shows appropriate messages

### Data Validation
- [ ] Empty action text is rejected
- [ ] Very long action text is handled gracefully
- [ ] Invalid time estimates are clamped (5-120 minutes)
- [ ] Malformed AI responses are handled
- [ ] Session data corruption is recovered

### User Experience
- [ ] Loading states are informative and encouraging
- [ ] Error messages are ADHD-friendly and not discouraging
- [ ] Keyboard navigation works throughout
- [ ] Mobile responsiveness is maintained
- [ ] High contrast mode works with new elements

## Performance Requirements

### Response Times
- [ ] Action editing responds immediately (<100ms)
- [ ] AI estimation completes within 10 seconds
- [ ] Timer starts within 1 second (requirement 3.8)
- [ ] Database saves complete within 2 seconds
- [ ] Page loads with action data within 3 seconds

### Resource Usage
- [ ] Memory usage remains stable during long sessions
- [ ] No memory leaks from action editing
- [ ] localStorage usage is reasonable (<5MB)
- [ ] API calls are properly debounced
- [ ] Unnecessary re-renders are avoided

## Accessibility & ADHD-Friendly Design

### Visual Design
- [ ] Action editing maintains high contrast
- [ ] Loading states are visually clear
- [ ] Error states are not overwhelming
- [ ] Success feedback is encouraging
- [ ] Time estimates are easy to scan

### Interaction Design
- [ ] Click targets are large enough (44px minimum)
- [ ] Hover states provide clear feedback
- [ ] Focus indicators are visible
- [ ] Keyboard shortcuts work as expected
- [ ] No unexpected focus changes

## Integration Testing

### End-to-End Workflow
- [ ] Complete user journey: input goal → edit actions → get estimates → run timer → view results → check dashboard
- [ ] Multiple sessions can be created and tracked
- [ ] Session data persists across browser sessions
- [ ] Offline/online transitions work smoothly
- [ ] Authentication state changes are handled

### Cross-Browser Testing
- [ ] Chrome: All functionality works
- [ ] Firefox: All functionality works  
- [ ] Safari: All functionality works
- [ ] Edge: All functionality works
- [ ] Mobile browsers: Core functionality works

## Security & Privacy

### Data Handling
- [ ] Action text is sanitized before AI calls
- [ ] Personal information is not logged
- [ ] RLS policies protect user data
- [ ] Session tokens are handled securely
- [ ] Offline data is encrypted in localStorage

## Sign-off

### Test Results
- [ ] All core functionality tests pass
- [ ] Performance requirements are met
- [ ] Accessibility standards are maintained
- [ ] Error handling is comprehensive
- [ ] User experience is ADHD-friendly

### Known Issues
Document any issues found during testing:

1. Issue: _______________
   Severity: ___________
   Workaround: _________

2. Issue: _______________
   Severity: ___________
   Workaround: _________

### Approval
- [ ] QA Testing Complete
- [ ] Ready for Production
- [ ] Documentation Updated

**Tester:** ________________  
**Date:** __________________  
**Version:** _______________