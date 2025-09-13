# Manual QA Checklist - Firefly ADHD Focus App

This checklist covers the complete user journey from task input to session completion, ensuring all core functionality works as expected for the hackathon MVP.

## Prerequisites
- [ ] App is running locally (`bun run dev`)
- [ ] Environment variables are configured (`.env.local`)
- [ ] Supabase database is set up and accessible

## Core User Journey Test

### 1. Landing Page Experience
- [ ] **Hero section displays** - Large "Firefly" title with compelling tagline and CTA button
- [ ] **Feature showcase loads** - Six ADHD-specific features with icons and descriptions
- [ ] **Demo preview works** - Three-step visual walkthrough of the app flow
- [ ] **CTA buttons function** - "Try Firefly Now" and "Start Your First Session" buttons work
- [ ] **Smooth scrolling** - Navigation between sections is smooth and responsive

### 2. Task Input Phase
- [ ] **Task input appears** - Clicking CTA shows focused task input interface
- [ ] **Back navigation works** - "Back to overview" button returns to landing page
- [ ] **Input field is focused** - Cursor automatically appears in the "What do you want to finish?" field
- [ ] **Input validation works** - Empty submission shows appropriate feedback
- [ ] **Goal submission succeeds** - Entering a goal (e.g., "Write a blog post") and pressing Enter/Submit works without page reload

### 2. AI Suggestion Phase
- [ ] **Suggestion placeholder appears** - Loading state is shown immediately after goal submission
- [ ] **AI suggestions load** - First step and next actions appear within reasonable time (< 10 seconds)
- [ ] **Fallback handling works** - If AI fails, static suggestions or graceful error message appears
- [ ] **Timer remains available** - "Start Focus" button is always clickable regardless of AI status

### 2.5. V1 Enhanced Actions Phase (if available)
- [ ] **Actions are editable** - Click on any AI-generated action to edit text inline
- [ ] **Edit saves immediately** - Changes to action text are saved without page reload
- [ ] **Delete actions works** - Delete button removes actions from the list
- [ ] **Add custom actions** - Users can add their own actions to the list
- [ ] **Update with AI button** - "Update with AI" button appears after editing actions
- [ ] **Time estimation works** - Clicking "Update with AI" returns time estimates for each action
- [ ] **Estimates display correctly** - Time estimates show with confidence levels (low/medium/high)
- [ ] **Fallback estimates** - Default estimates appear if AI estimation fails

### 3. Timer Phase
- [ ] **Timer presets display** - 25, 45, and 50 minute options are visible
- [ ] **Custom durations work** - If actions have time estimates, custom timer durations are available
- [ ] **Action selection** - User can select specific action to work on (if V1 features available)
- [ ] **Timer starts quickly** - Clicking "Start Focus" begins countdown within 1 second
- [ ] **Visual timer works** - Shrinking disc and mm:ss countdown display correctly
- [ ] **Timer controls function** - Pause, resume, stop, and mark complete buttons work as expected
- [ ] **Timer accuracy** - Time counts down accurately (test for ~30 seconds)
- [ ] **Action progress** - Current action context is displayed during timer (if V1 available)

### 4. Session Completion Phase
- [ ] **Stop timer works** - Manually stopping timer before completion works
- [ ] **Completion detection** - Timer reaching 00:00 triggers completion flow
- [ ] **Variance calculation** - Summary shows planned vs actual time comparison
- [ ] **Friendly messaging** - Variance summary uses encouraging, ADHD-friendly language
- [ ] **Session persistence** - Session data is stored (check browser dev tools or database)

### 5. Navigation & Flow
- [ ] **Landing to task flow** - Smooth transition from landing page to task input
- [ ] **Return to input** - Clear path back to task input for next session
- [ ] **Return to landing** - Option to go back to full landing page experience
- [ ] **State management** - App maintains appropriate state between phases
- [ ] **Responsive design** - Interface works on different screen sizes, especially landing page
- [ ] **Keyboard navigation** - Tab navigation works throughout the app and landing page
- [ ] **Timer keyboard shortcuts** - Space (pause/resume), Enter (mark complete), Escape (stop), Arrow keys (navigate actions) work correctly

## Performance Requirements
- [ ] **Timer start latency** - Timer begins within 1 second of clicking "Start Focus"
- [ ] **AI response time** - Suggestions appear within 10 seconds or fallback is shown
- [ ] **Page load speed** - Initial page load completes within 3 seconds
- [ ] **No blocking operations** - User can always start timer regardless of AI status

## Accessibility Checks
- [ ] **Keyboard navigation** - All interactive elements accessible via keyboard
- [ ] **Focus indicators** - Clear visual focus indicators on all interactive elements
- [ ] **High contrast** - Text is readable with sufficient color contrast
- [ ] **Reduced motion** - Animations respect user's motion preferences
- [ ] **Screen reader friendly** - Basic screen reader navigation works

## Error Handling
- [ ] **Network failures** - App works offline for timer functionality
- [ ] **AI service failures** - Graceful degradation when AI services are unavailable
- [ ] **Invalid inputs** - Appropriate handling of edge cases and invalid data
- [ ] **Browser compatibility** - Works in modern browsers (Chrome, Firefox, Safari, Edge)

## Dashboard & Analytics (if authenticated)
- [ ] **Dashboard access** - `/dashboard` route requires authentication and loads properly
- [ ] **Stats accuracy** - Total focus time, completion rate, and session count are correct
- [ ] **Personal records** - Longest session, best week, and streak data display accurately
- [ ] **Streak calculation** - Current streak counts consecutive days with completed sessions
- [ ] **Longest streak** - Historical maximum streak is calculated correctly
- [ ] **Session history** - Last 10 sessions display with correct goal, duration, and variance
- [ ] **Progress insights** - Contextual messages appear based on user activity patterns
- [ ] **Quick start** - "Start New Session" button navigates to timer interface
- [ ] **Loading states** - Dashboard shows appropriate loading indicators while fetching data
- [ ] **Error handling** - Dashboard gracefully handles API failures with fallback content

## Data Persistence (if authenticated)
- [ ] **Session storage** - Completed sessions are saved to database
- [ ] **User isolation** - User can only see their own data (if multiple users)
- [ ] **Data integrity** - Session data includes all required fields (goal, planned/actual duration, variance)

## Edge Cases
- [ ] **Very short goals** - Single word goals work correctly
- [ ] **Very long goals** - Long text inputs are handled appropriately
- [ ] **Timer edge cases** - Pausing/resuming multiple times works correctly
- [ ] **Browser tab switching** - Timer continues accurately when tab is not active
- [ ] **System sleep/wake** - Timer handles system sleep/wake cycles appropriately
- [ ] **Timer component routing** - Regular timer used when no actions, ActionTimer used with actions
- [ ] **Component switching** - Smooth transition between timer types based on action presence

## Success Criteria
✅ **Complete user journey works**: Input → AI suggestions → Timer → Results → Return to input
✅ **Core performance met**: Timer starts < 1 second, AI responds < 10 seconds or falls back
✅ **ADHD-friendly UX**: Minimal cognitive load, encouraging messaging, distraction-free interface
✅ **Data persistence**: Session data is correctly stored and retrievable

## Test Data Examples

### Sample Goals for Testing
Use these sample goals for consistent testing:
- "Write a blog post about productivity"
- "Clean my desk and organize papers"
- "Review and respond to emails"
- "Study for upcoming presentation"
- "Plan weekend activities"

### V1 Enhanced Actions Test Data
Sample action modifications for testing:
- **Original**: "Research the topic" → **Edited**: "Research productivity techniques online"
- **Original**: "Write content" → **Edited**: "Write 500-word introduction section"
- **Custom Addition**: "Take a 5-minute break between sections"
- **Expected Estimates**: 15-45 minutes per action with confidence levels

## Notes
- This is a hackathon-scope checklist focusing on core functionality
- Automated testing covers utility functions; this manual testing covers user experience
- Any failing items should be documented with steps to reproduce
- Priority: Core user journey must work end-to-end before considering the app ready