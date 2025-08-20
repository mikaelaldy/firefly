# Requirements Document

## Introduction

Firefly is a lightweight Next.js web application designed to help ADHD users overcome task paralysis and time blindness by providing immediate, actionable guidance to start meaningful work. The core principle is to enable users to begin productive work within seconds through AI-generated micro-tasks, visual timing tools, and minimal cognitive overhead.

The application addresses the common ADHD challenge of getting stuck at the starting line by breaking down user goals into immediately actionable 60-second tasks, providing a distraction-free environment with big visual timers, and offering gentle accountability through time tracking and variance analysis.

## Requirements

### Requirement 1: Task Input Interface

**User Story:** As an ADHD user, I want to quickly input my goal or task in a simple, distraction-free interface, so that I can immediately get actionable guidance without cognitive overhead.

#### Acceptance Criteria

1. WHEN the user visits the landing page THEN the system SHALL display a single centered text input with the prompt "What do you want to finish?"
2. WHEN the user submits a goal THEN the system SHALL accept the input and initiate AI processing without page reload
3. WHEN the user submits a goal THEN the system SHALL allow the user to start a timer immediately without waiting for AI output
4. IF the input field is empty THEN the system SHALL prevent submission and provide clear feedback
5. WHEN the user types in the input field THEN the system SHALL provide immediate visual feedback that input is being captured

### Requirement 2: AI-Powered Task Breakdown

**User Story:** As an ADHD user, I want AI to break down my goal into a 60-second first step and actionable next steps, so that I can overcome task paralysis and know exactly what to do first.

#### Acceptance Criteria

1. WHEN the user submits a goal THEN the system SHALL send the goal to Gemini AI using Google AI Studio SDK (@google/genai)
2. WHEN AI processing completes THEN the system SHALL display a 60-second mini-task labeled as "First small step"
3. WHEN AI processing completes THEN the system SHALL display 3-5 actionable next steps
4. WHEN the system calls Gemini Flash AND receives a rate limit error THEN the system SHALL automatically fall back to Flash-Lite or static suggestions
5. WHEN AI processing fails completely THEN the system SHALL provide static fallback suggestions
6. WHEN AI output is generated THEN the system SHALL display results inline without page reload
7. IF AI processing fails THEN the system SHALL provide fallback guidance and allow timer start

### Requirement 3: Visual Countdown Timer

**User Story:** As an ADHD user, I want a large, visual countdown timer with preset durations, so that I can maintain focus and have clear awareness of time passing.

#### Acceptance Criteria

1. WHEN the user chooses to start a timer THEN the system SHALL offer preset durations of 25, 45, and 50 minutes
2. WHEN the timer is active THEN the system SHALL display a shrinking disc visual representation
3. WHEN the timer is active THEN the system SHALL display time remaining in mm:ss format
4. WHEN the timer is active THEN the system SHALL provide optional soft tick sound
5. WHEN the user clicks pause THEN the system SHALL pause the timer and allow resume
6. WHEN the user clicks resume THEN the system SHALL continue from the paused time
7. WHEN the timer completes THEN the system SHALL provide an optional 25% buffer period before starting next block
8. WHEN the timer starts THEN the system SHALL begin countdown within 1 second of user clicking "Start Focus"

### Requirement 4: Time Tracking and Variance Analysis

**User Story:** As an ADHD user, I want to see how my actual work time compares to my planned time, so that I can build better time awareness and celebrate my focus achievements.

#### Acceptance Criteria

1. WHEN the user starts a timer THEN the system SHALL record the planned duration
2. WHEN the user completes or stops the timer THEN the system SHALL record the actual completion time
3. WHEN a work session ends THEN the system SHALL display a friendly variance summary comparing planned vs actual time
4. WHEN displaying variance THEN the system SHALL use encouraging language (e.g., "You estimated 25m, finished in 28m—great focus!")
5. WHEN variance is calculated THEN the system SHALL store the data for the current session

### Requirement 5: Buffer and Micro-Deadline Management

**User Story:** As an ADHD user, I want the system to help me account for time optimism and provide visual cues for upcoming deadlines, so that I can better manage time-sensitive tasks.

#### Acceptance Criteria

1. IF the user indicates a due date/time is soon THEN the system SHALL automatically add a 25% time buffer
2. WHEN the user has a deadline THEN the system SHALL support simple If-Then planning (e.g., "If it's 9 AM and not started → warm-up for 10m")
3. WHEN a deadline exists THEN the system SHALL display a visual ladder timeline from current time to due date
4. WHEN displaying timeline THEN the system SHALL show auto-suggested checkpoints as visual cues only
5. WHEN timeline is displayed THEN the system SHALL NOT require user interaction with timeline elements in v0

### Requirement 6: Optional Authentication

**User Story:** As an ADHD user, I want the option to sign in with Google, so that I can potentially sync my data across devices in future versions.

#### Acceptance Criteria

1. WHEN the user chooses to sign in THEN the system SHALL provide Supabase Google OAuth login option
2. WHEN Supabase Auth is implemented THEN the system SHALL handle authentication securely
3. WHEN user authentication is not required THEN the system SHALL function fully without login
4. IF authentication fails THEN the system SHALL allow continued use without login
5. WHEN implementing OAuth THEN the system SHALL prepare for future cloud sync capabilities

### Requirement 7: Performance and Accessibility

**User Story:** As an ADHD user, I want the application to be fast, accessible, and minimally distracting, so that I can focus on my work without technical barriers.

#### Acceptance Criteria

1. WHEN the user clicks "Start Focus" THEN the timer SHALL begin within 1 second
2. WHEN the application loads THEN the system SHALL be fully keyboard navigable
3. WHEN displaying content THEN the system SHALL use high-contrast colors by default
4. WHEN animations are present THEN the system SHALL minimize motion by default
5. WHEN the user interacts with the interface THEN the system SHALL provide clear focus indicators
6. WHEN the application is used THEN the system SHALL maintain responsive design across devices

### Requirement 8: Privacy and Data Handling

**User Story:** As an ADHD user, I want my personal information to be protected and minimal data to be stored, so that I can use the app without privacy concerns.

#### Acceptance Criteria

1. WHEN making AI calls THEN the system SHALL NOT log personal identifiers
2. WHEN storing user data THEN the system SHALL use Supabase Row Level Security (RLS) policies
3. WHEN handling user input THEN the system SHALL process data securely
4. WHEN data is persisted THEN the system SHALL isolate user data using RLS policies
5. IF data is stored THEN the system SHALL follow privacy best practices with Supabase security

### Requirement 9: User Journey Flow

**User Story:** As an ADHD user, I want a simple, repeatable workflow that guides me from task input to completion and back to the next task, so that I can maintain productive momentum.

#### Acceptance Criteria

1. WHEN the user completes the landing input THEN the system SHALL display AI suggestions immediately
2. WHEN AI suggestions are shown THEN the system SHALL allow immediate timer start
3. WHEN a work session completes THEN the system SHALL show variance summary
4. WHEN variance summary is displayed THEN the system SHALL offer optional buffer/deadline suggestions
5. WHEN the user finishes reviewing results THEN the system SHALL provide clear path back to task input
6. WHEN returning to input THEN the system SHALL allow seamless transition to next task

### Requirement 10: Enhanced Landing Page for Demo

**User Story:** As a hackathon demo viewer, I want to see an engaging landing page that clearly explains Firefly's value proposition and showcases its features, so that I can quickly understand what the app does and be motivated to try it.

#### Acceptance Criteria

1. WHEN a visitor lands on the homepage THEN the system SHALL display a compelling hero section with the app's tagline and value proposition
2. WHEN the landing page loads THEN the system SHALL showcase key features with visual icons and brief descriptions
3. WHEN displaying features THEN the system SHALL highlight ADHD-specific benefits (task paralysis, time blindness, focus support)
4. WHEN a visitor scrolls THEN the system SHALL show a quick demo or screenshot of the timer interface
5. WHEN the landing page is viewed THEN the system SHALL include a clear call-to-action to "Try Firefly Now"
6. WHEN the CTA is clicked THEN the system SHALL smoothly transition to the task input interface
7. WHEN displaying the landing page THEN the system SHALL maintain the same accessibility standards as the main app
8. WHEN viewed on mobile THEN the system SHALL provide a responsive, touch-friendly experience

### Requirement 11: User Dashboard and Analytics

**User Story:** As a logged-in ADHD user, I want to see my focus session history, productivity stats, and personal records, so that I can track my progress and celebrate my achievements over time.

#### Acceptance Criteria

1. WHEN a user logs in with Google THEN the system SHALL redirect to a personalized dashboard
2. WHEN the dashboard loads THEN the system SHALL display total focus time for the current week
3. WHEN showing stats THEN the system SHALL display average session length and completion rate
4. WHEN displaying history THEN the system SHALL show the last 10 focus sessions with goals and durations
5. WHEN showing session history THEN the system SHALL include variance data (planned vs actual time)
6. WHEN displaying records THEN the system SHALL highlight personal bests (longest session, best week, streak days)
7. WHEN the user views their dashboard THEN the system SHALL provide encouraging insights about their focus patterns
8. WHEN displaying analytics THEN the system SHALL use positive, ADHD-friendly language that celebrates progress
9. WHEN the dashboard is accessed THEN the system SHALL include a prominent "Start New Session" button
10. WHEN viewing historical data THEN the system SHALL respect user privacy and only show data for the authenticated user
11. WHEN no historical data exists THEN the system SHALL show an encouraging onboarding message with tips for getting started