# V1 Features Testing Plan

## Test Workflow: Edit Actions → Get Estimates → Run Timers → Track Progress

### 1. Action Editing UX Tests

#### 1.1 Inline Editing
- [ ] Click on action text to enter edit mode
- [ ] Input field appears with current text selected
- [ ] Enter key saves changes
- [ ] Escape key cancels changes
- [ ] Click outside saves changes
- [ ] Visual feedback shows editing state

#### 1.2 Add/Delete Actions
- [ ] "Add Action" button creates new editable action
- [ ] New action immediately enters edit mode
- [ ] Delete button shows confirmation dialog
- [ ] Deleted actions are removed from list
- [ ] Actions can be reordered with up/down buttons

#### 1.3 Custom Action Indicators
- [ ] Modified actions show "edited" badge
- [ ] Custom actions show "Custom" badge
- [ ] Original text is preserved for comparison

### 2. AI Time Estimation Tests

#### 2.1 Automatic Estimation
- [ ] AI estimation triggers automatically on component load
- [ ] Loading state shows during estimation
- [ ] Time estimates appear next to actions
- [ ] Confidence levels are displayed (low/medium/high)
- [ ] Total time is calculated and shown

#### 2.2 Manual Re-estimation
- [ ] "Update with AI" button triggers re-estimation
- [ ] Modified actions get new estimates
- [ ] Loading state during manual estimation
- [ ] Error handling for failed estimations

#### 2.3 Fallback Handling
- [ ] Static fallbacks when AI fails
- [ ] Rate limiting gracefully handled
- [ ] Network errors don't break functionality

### 3. Timer Integration Tests

#### 3.1 Custom Duration Selection
- [ ] Actions with estimates appear in timer launcher
- [ ] Estimated duration used as timer duration
- [ ] Action context displayed during timer
- [ ] Mode switching between presets and actions

#### 3.2 Action Progress Tracking
- [ ] Current action highlighted during timer
- [ ] Actions marked complete when timer finishes
- [ ] Actual vs estimated time tracked
- [ ] Progress updates in real-time

### 4. Database Persistence Tests

#### 4.1 Action Session Creation
- [ ] New sessions saved to action_sessions table
- [ ] Actions saved to editable_actions table
- [ ] User isolation via RLS policies
- [ ] Offline mode creates local sessions

#### 4.2 Progress Persistence
- [ ] Action completion status persisted
- [ ] Time tracking data saved
- [ ] Session updates sync to database
- [ ] Offline/online sync works correctly

### 5. Dashboard Integration Tests

#### 5.1 Action Session History
- [ ] Completed sessions appear in dashboard
- [ ] Action details shown in session history
- [ ] Estimated vs actual time displayed
- [ ] Custom actions properly labeled

#### 5.2 Analytics Integration
- [ ] Time estimation accuracy insights
- [ ] Action completion rates
- [ ] Custom vs AI action performance

### 6. Error Handling Tests

#### 6.1 AI Service Failures
- [ ] Graceful degradation when AI unavailable
- [ ] Fallback estimates provided
- [ ] User can still proceed with timer
- [ ] Error messages are user-friendly

#### 6.2 Database Failures
- [ ] Offline mode activates on DB errors
- [ ] Local storage fallbacks work
- [ ] Sync resumes when connection restored
- [ ] No data loss during failures

### 7. Accessibility Tests

#### 7.1 Keyboard Navigation
- [ ] All action editing accessible via keyboard
- [ ] Tab order is logical
- [ ] Enter/Escape keys work in edit mode
- [ ] Focus indicators visible

#### 7.2 Screen Reader Support
- [ ] Action states announced properly
- [ ] Time estimates read correctly
- [ ] Edit mode changes announced
- [ ] Progress updates accessible

## Test Results

### Manual QA Checklist Results
- [ ] Complete workflow tested end-to-end
- [ ] All critical paths verified
- [ ] Error scenarios handled gracefully
- [ ] Performance meets requirements
- [ ] Accessibility standards met

### Issues Found
(To be filled during testing)

### Fixes Applied
(To be filled during testing)