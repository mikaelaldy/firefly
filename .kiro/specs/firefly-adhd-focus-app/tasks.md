# Implementation Plan (Lean MVP)

- [x] 1. Scaffold app





  - Create Next.js 14+ (App Router) project with Bun; keep npm fallback scripts
  - Install Tailwind; enable TypeScript strict
  - Base folders: app/, components/, lib/, types/
  - _Requirements: 7.1, 7.4_

- [x] 2. Types & contracts





  - Define TimerState, TimerSession, UserPreferences
  - Define /api/ai/suggest SuggestRequest/Response
  - Export from types/index.ts
  - _Requirements: 2.2, 2.3, 4.1, 4.2_

- [x] 3. Supabase setup





  - Add envs: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - Initialize Supabase client (browser + server)
  - _Requirements: 6.1, 8.1_

- [x] 4. DB schema & RLS





  - Apply SQL for profiles, tasks, suggestions, sessions + RLS owner policies
  - Seed script (optional) for demo data
  - _Requirements: 6.1, 8.1, 8.3_

- [x] 5. Auth (Supabase)





  - Enable Google provider in Supabase; implement simple login/logout UI
![1755331319898](image/tasks/1755331319898.png)  - Gate writes by auth; app still works read-less w/o login (timer + local state)
  - _Requirements: 6.1, 6.3_

- [x] 6. Landing page






  - TaskInput: centered input, validation, no reload submit
  - On submit: create tasks row (optimistic UI)
  - _Requirements: 1.1, 1.2, 7.2, 7.3_

- [x] 7. AI suggest API


  - /api/ai/suggest: call Google AI Studio via @google/genai (Gemini Flash → Flash-Lite → static)
  - Parse { firstStep, nextActions }; write suggestions row
  - Never block Start button; show placeholder while loading
  - _Requirements: 2.1, 2.2, 2.3, 2.6_

- [x] 8. AIResponse UI





  - Render first step + next actions inline; loading & error states
  - Progressive enhancement: timer usable even if AI fails
  - _Requirements: 1.3, 2.6_

- [x] 9. Timer core





  - VisualTimer (shrinking disc + mm:ss) + TimerControls (pause/resume/stop)
  - Presets 25/45/50; start within <1s
  - Simple drift correction on resume (no sub-second engine)
  - _Requirements: 3.1, 3.2, 3.3, 3.8_

- [x] 10. Sessions & variance




  - On stop: compute variance; insert sessions row (planned/actual)
  - Results page: friendly variance summary + positive reinforcement copy
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 11. Buffer & micro-deadline (visual-only)





  - ✅ Type definitions: DeadlineInfo, IfThenPlan, TimelineCheckpoint
  - If due soon: suggest +25% buffer
  - Simple If-Then plan input (non-blocking)
  - Visual ladder timeline (non-interactive)
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 12. Accessibility & prefs





  - ✅ PreferencesProvider with React Context for global state management
  - ✅ ADHD-optimized defaults (reduced motion ON, sounds OFF, 25min timer)
  - ✅ localStorage persistence with automatic save/load and error handling
  - ✅ CSS class application for high-contrast and reduced-motion modes
  - ✅ Keyboard nav; high-contrast toggle; respect reduced motion
  - ✅ UserPreferences persisted locally (optionally a profiles column later)
  - _Requirements: 7.2, 7.3, 7.4_

- [x] 13. Minimal testing (hackathon scope)










  - Manual QA checklist: input → suggestion placeholder → start timer → stop → summary → session row exists
  - 1 unit test: variance calculation utility
  - _Requirements: 9.1–9.4 (journey), 3.8 (perf), 4.2 (variance)_

- [x] 14. Security & privacy





  - Strip PII from AI prompts (send goal text only)
  - Verify RLS policies with one positive/negative query each
  - _Requirements: 8.1, 8.3_

- [x] 15. Enhanced landing page for hackathon demo






  - ✅ Create HeroSection with compelling tagline and value proposition
  - ✅ Build FeatureShowcase highlighting ADHD-specific benefits with icons
  - ✅ Add DemoPreview component with timer interface screenshots
  - ✅ Implement smooth CTA transition to task input
  - ✅ Ensure responsive design for mobile demo viewing
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_

- [x] 16. User dashboard and analytics system






  - Create /api/dashboard/stats endpoint for user analytics
  - Build DashboardStats component showing weekly focus time and completion rate
  - Implement SessionHistory component with last 10 sessions and variance data
  - Create PersonalRecords component highlighting achievements and streaks
  - Add ProgressInsights with encouraging, ADHD-friendly analytics messages
  - Build dashboard route (/dashboard) with authentication guard
  - Add QuickStart component with prominent "Start New Session" button
  - Implement OnboardingMessage for users with no historical data
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11_

- [x] 17. Polish & demo




  - Ensure Start is never blocked; handle offline timer gracefully
  - Write quick README: run scripts (Bun for dev, npm for build/deploy), env setup, demo steps
  - Test complete user journey from landing page to dashboard
  - _Requirements: All integration_

## V1 Feature: Enhanced Next Actions Management

- [x] 18. Database schema for action sessions






  - Create action_sessions table with user_id, goal, estimated/actual time tracking
  - Create editable_actions table with session relationships and time estimates
  - Add RLS policies for user data isolation on both tables
  - Write migration script and test with sample data
  - Add TypeScript interfaces for EditableAction and ActionSession
  - _Requirements: 12.11, 12.12_

- [x] 19. AI time estimation API endpoint





  - Create /api/ai/estimate endpoint accepting array of action strings
  - Implement Gemini prompt for ADHD-friendly time estimation
  - Return structured response with minutes and confidence levels
  - Add fallback handling and rate limiting
  - _Requirements: 12.7, 12.8_

- [x] 20. EditableNextActions component





- [x] 20.1 Build inline editing functionality







  - Create editable text fields for each AI-generated action
  - Implement click-to-edit with immediate save to local state
  - Add visual feedback for editing mode and save states
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 20.2 Add delete and add action capabilities


  - Implement delete button with confirmation for each action
  - Create "Add Action" button to insert custom actions
  - Handle reordering of actions in the list
  - _Requirements: 12.4, 12.5_

- [x] 20.3 Integrate AI re-estimation feature


  - Add "Update with AI" button that sends modified actions to /api/ai/estimate
  - Display loading state during AI estimation calls
  - Update action list with time estimates and confidence indicators
  - _Requirements: 12.6, 12.7, 12.8, 12.9_

- [-] 21. Enhanced timer with custom durations



- [x] 21.1 Modify timer to accept estimated durations







  - Update TimerLauncher to use action estimates instead of presets
  - Display current action context during timer sessions
  - Allow selection of specific action to work on
  - _Requirements: 12.10_
-

- [x] 21.2 Action progress tracking





  - Mark actions as completed when timer finishes
  - Track actual time spent vs estimated time per action
  - Update session progress in real-time
  - _Requirements: 12.11, 12.12_

- [x] 22. Session persistence and sync





- [-] 22.1 Save action sessions to database










  - Create ActionSession service for CRUD operations
  - Persist user modifications and AI estimates to Supabase
  - Handle offline/online sync for action data
  - _Requirements: 12.11, 12.12_

- [x] 22.2 Dashboard integration for action tracking







  - Update dashboard to display action session history
  - Show estimated vs actual time for completed actions
  - Add insights about time estimation accuracy
  - _Requirements: 12.12_

- [x] 22.3 Comprehensive offline sync system








  - Implement automatic offline detection and graceful degradation
  - Add localStorage-based offline data storage with sync queuing
  - Create automatic sync on network reconnection with retry logic
  - Handle database errors by falling back to offline mode
  - Add utility functions for sync status monitoring and manual sync
  - _Requirements: 12.11, 12.12, Progressive Enhancement_

## V1.1 Feature: Advanced Timer Controls and Action Navigation
![1757778838523](image/tasks/1757778838523.png)
- [x] 24. Enhanced timer controls UI






- [x] 24.1 Add "Mark Complete" functionality


  - ✅ Add "Mark Complete" button to timer interface alongside existing controls
  - ✅ Implement confirmation dialog when marking action complete early
  - ✅ Update action status and record actual time spent
  - ✅ Enhanced TimerControls component with new props: onMarkComplete, showMarkComplete
  - ✅ Keyboard shortcut support (Enter key) for mark complete functionality
  - ✅ Visual keyboard shortcut guide integrated into timer controls
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 24.2 Implement time extension controls


  - Add "Add Time" button that appears when timer reaches zero
  - Create preset extension options (5, 10, 15 minutes) and custom input
  - Track time extensions per action and update timer duration
  - _Requirements: 13.4, 13.5, 13.6_



- [x] 24.3 Build action navigation system










  - Add Previous/Next action buttons to timer interface
  - Implement action switching with timer pause and confirmation
  - Handle edge cases (first/last action, no more actions)
  - _Requirements: 13.7, 13.8, 13.9_

- [-] 25. Action status management




- [x] 25.1 Implement action status tracking


  - Update EditableAction interface with status, actualMinutes, timeExtensions
  - Create action status update functions (complete, skip, reactivate)
  - Handle status transitions and validation
  - _Requirements: 13.2, 13.9, 13.10_

- [ ] 25.2 Build session completion logic
  - Detect when all actions are completed or skipped
  - Generate session summary with completion statistics
  - Save detailed action-level progress data
  - _Requirements: 13.11, 13.12_

- [ ] 26. API endpoints for advanced controls

- [ ] 26.1 Create action update API
  - Build /api/actions/update endpoint for status changes
  - Handle action completion, skipping, and reactivation
  - Return updated session progress information
  - _Requirements: 13.2, 13.9, 13.10_

- [ ] 26.2 Create timer extension API
  - Build /api/timer/extend endpoint for time additions
  - Track extension history and reasons
  - Update action and session timing data
  - _Requirements: 13.5, 13.6_

- [ ] 27. Database schema updates

- [ ] 27.1 Extend action tracking tables
  - Add status, actualMinutes, timeExtensions columns to editable_actions
  - Create timer_extensions table for detailed extension tracking
  - Update RLS policies for new data structures
  - _Requirements: 13.6, 13.12_

- [ ] 27.2 Update session progress tracking
  - Add completedCount, skippedCount, currentActionIndex to action_sessions
  - Create indexes for efficient action navigation queries
  - Test data integrity with action status changes
  - _Requirements: 13.11, 13.12_

- [ ] 28. Testing and integration

- [ ] 28.1 Test advanced timer workflows
  - Test complete workflow: start action → mark complete early → move to next
  - Test time extension: timer ends → add time → continue working
  - Test action navigation: switch between actions with state preservation
  - _Requirements: 13.1-13.12_

- [ ] 28.2 Test edge cases and error handling
  - Test behavior with single action vs multiple actions
  - Test offline functionality for timer controls
  - Test data persistence across browser sessions
  - Manual QA for UX flow and accessibility
  - _Requirements: 13.1-13.12_