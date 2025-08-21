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

- [ ] 17. Polish & demo
  - Ensure Start is never blocked; handle offline timer gracefully
  - Write quick README: run scripts (Bun for dev, npm for build/deploy), env setup, demo steps
  - Test complete user journey from landing page to dashboard
  - _Requirements: All integration_