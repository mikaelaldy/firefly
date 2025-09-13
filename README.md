# Firefly ADHD Focus App

A lightweight Next.js application that helps ADHD users overcome task paralysis through AI-powered task breakdown and visual focus timers. Built for immediate action - timer starts in <1 second, works offline, with progressive enhancement.

## Key Features

- **Instant Focus**: Timer starts immediately, never blocked by AI processing
- **Task Breakdown**: AI generates 60-second first steps and actionable next actions
- **Editable Actions**: Modify, delete, and add custom actions with AI time estimation (V1)
- **Smart Time Estimates**: AI provides realistic time estimates for ADHD users with confidence levels
- **Visual Timer**: Shrinking disc with 25/45/50 minute presets or custom durations
- **Enhanced Timer Controls**: Mark actions complete early, integrated action navigation, time extensions, comprehensive keyboard shortcuts with detailed status tracking
- **Sound System**: Optional timer ticking, session alarms, and break notifications with full customization and robust error handling
- **Automatic Breaks**: Pomodoro-style break management (5min short, 15min long breaks)
- **Variance Tracking**: Compare planned vs actual time with encouraging feedback
- **Offline-First Design**: Full functionality works offline with automatic sync when reconnected
- **Progressive Enhancement**: Core functionality works without AI or authentication
- **ADHD-Optimized**: Reduced motion, high contrast, minimal cognitive overhead, customizable audio
- **Dashboard Analytics**: Track progress, streaks, and personal records (when signed in)

## Quick Start

### Development (Fast Iteration)
```bash
# Install dependencies
bun install

# Copy environment template
cp .env.example .env.local

# Set up environment variables (see Configuration below)
# Start development server
bun run dev
```

### Production Build & Deploy
```bash
# Build for production (stable)
npm run build

# Start production server
npm run start
```

### Configuration

Create `.env.local` with your API keys:

```bash
# Supabase (for auth & data persistence)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Studio (for task suggestions)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

**Note**: App works without these keys - timer and local state function offline.

## Demo Steps

### Complete User Journey
1. **Landing Page**: Visit `http://localhost:3000` - see hero, features, demo preview
2. **Task Input**: Click "Get Started" → enter a goal (e.g., "Write project proposal")
3. **AI Suggestions**: See 60-second first step + next actions (or fallback if offline)
4. **Edit Actions** (V1): Click to edit action text, delete unwanted actions, add custom ones
5. **Get Time Estimates** (V1): Click "Update with AI" to get realistic time estimates for each action
6. **Sound Settings**: Click sound icon to customize ticking, alarms, and break notifications
7. **Timer Start**: Click "Start Focus Timer" → choose preset or use AI-estimated duration
8. **Focus Session**: Visual countdown with optional ticking sound, integrated timer controls (pause/resume/stop/mark complete/navigate), keyboard shortcuts (Space, Enter, Escape, Arrow keys)
9. **Time Extensions** (V1.1): When timer reaches zero, choose to add 5/10/15 minutes or custom amount, with extension history tracking
10. **Action Navigation** (V1.1): Use integrated Previous/Next buttons or arrow keys to switch between actions with confirmation dialogs
11. **Session Complete**: Hear completion alarm, automatic break timer with suggestions
12. **Results**: See variance analysis and encouraging feedback
13. **Dashboard**: Sign in with Google → automatically redirected to three-column dashboard with:
    - **Navigation & Quick Stats**: Left sidebar with today's focus time, current streak, completion rate
    - **Ready to Focus**: Center section with multiple session start options (Quick Focus 25min, Deep Work 50min, Custom Goal)
    - **Personal Records**: Right sidebar showcasing achievements (longest session, best week, streaks)

### Testing Offline Mode
- Disconnect internet → timer still works with fallback suggestions
- Create action sessions and complete actions while offline
- Reconnect internet → automatic sync of all offline work
- All core functionality available without authentication
- See `docs/offline-sync-system.md` for detailed offline capabilities

## Architecture

**Tech Stack**: Next.js 14 + Bun (dev) + npm (prod) + Tailwind + Supabase + Google AI

**Key Principle**: Progressive enhancement - timer works immediately, AI enhances the experience

### Timer Architecture

The timer system uses a dual-component architecture:

- **Timer Component**: Smart router that selects appropriate timer implementation
- **RegularTimer**: Basic timer functionality for standard focus sessions
- **ActionTimer**: Enhanced timer with action tracking and session management

This separation ensures clean code organization while supporting both basic and advanced use cases. See `docs/timer-architecture.md` for detailed technical documentation.

### Dashboard Architecture

The dashboard features a modern three-column layout optimized for ADHD users:

- **Left Sidebar**: Integrated navigation with quick stats (Today's focus, Current streak, Completion rate)
- **Center Content**: Primary actions (Ready to Focus section with quick options), weekly stats, recent sessions
- **Right Sidebar**: Personal records showcase with achievement cards (Longest session, Best week, Current/Longest streaks)
- **ADHD-Optimized Design**: Clear information hierarchy, reduced cognitive load, positive reinforcement
- **Progressive Enhancement**: Works with or without historical data, encouraging empty states

See `docs/dashboard-analytics-system.md` for detailed documentation.

## Development Commands

```bash
# Development (fast iteration with Bun)
bun run dev

# Production build (stable with npm)
npm run build && npm run start

# Database setup
bun run db:setup

# Testing
bun run test
bun run verify:testing

# Authentication verification
bun run verify:auth
```

### Debugging

The app includes comprehensive console logging for development and troubleshooting:

- **Authentication Context**: Enhanced logging for session initialization, auth state changes, and error tracking
- **Session Saving**: Monitor session data persistence and user authentication
- **Authentication Flow**: Production-ready OAuth callback with load balancer support and error handling
- **Dashboard Authentication**: Enhanced timing for OAuth callback processing with delayed redirect logic
- **Dashboard Analytics**: Detailed logging of session queries, data processing, and metrics calculations
  - Session count and data structure validation
  - User authentication status and token handling
  - Statistics computation and personal records calculation

Open browser dev tools to view detailed logs during development. See `docs/auth-setup.md` for authentication debugging and `docs/testing-guide.md` for other debugging scenarios.

## Manual QA Checklist

**Core User Journey** (5 minutes):
1. ✅ Landing page loads with hero, features, demo preview
2. ✅ Click "Get Started" → smooth scroll to task input
3. ✅ Enter goal → see task created confirmation
4. ✅ AI suggestions appear (or fallback if offline)
5. ✅ Click "Start Focus Timer" → timer starts within 1 second
6. ✅ Visual countdown works, pause/resume functional
7. ✅ Stop timer → see variance summary with encouraging message
8. ✅ Session saved to database (if authenticated)

**V1 Enhanced Actions Journey** (additional 3 minutes):
1. ✅ Click to edit AI-generated actions inline
2. ✅ Delete unwanted actions and add custom ones
3. ✅ Click "Update with AI" → see time estimates with confidence levels
4. ✅ Select action with estimate → timer uses custom duration
5. ✅ Action progress tracked and synced to dashboard

**Sound Features Journey** (additional 2 minutes):
1. ✅ Click sound icon → access comprehensive sound settings
2. ✅ Test ticking, alarm, and break notification sounds
3. ✅ Adjust volume and enable/disable individual sound types
4. ✅ Start timer → hear optional ticking during focus session
5. ✅ Complete session → hear completion alarm and automatic break timer
6. ✅ Experience Pomodoro-style break management (5min/15min breaks)

**Note**: V1.1 TypeScript interfaces include enhanced action status tracking with required status field and completion timestamps for comprehensive session analytics.

**Progressive Enhancement**:
- ✅ Timer works without AI suggestions
- ✅ Timer works without authentication
- ✅ Offline mode provides fallback suggestions
- ✅ High contrast and reduced motion preferences work

**Authentication Flow**:
- ✅ Google OAuth sign-in with production-ready callback handling
- ✅ Load balancer support for deployment environments
- ✅ User-friendly error handling with troubleshooting guidance
- ✅ Successful authentication redirects directly to dashboard
- ✅ Enhanced dashboard authentication with OAuth callback timing support
- ✅ Dashboard shows analytics and session history with stable CSS implementation
- ✅ App works fully without signing in

## Deployment

**Vercel/Netlify Ready**: 
- Build: `npm run build`
- Environment: Add Supabase + Google AI keys
- OAuth: Configure redirect URLs in Supabase dashboard