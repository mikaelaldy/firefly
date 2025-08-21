# Firefly ADHD Focus App

A lightweight Next.js application that helps ADHD users overcome task paralysis through AI-powered task breakdown and visual focus timers. Built for immediate action - timer starts in <1 second, works offline, with progressive enhancement.

## Key Features

- **Instant Focus**: Timer starts immediately, never blocked by AI processing
- **Task Breakdown**: AI generates 60-second first steps and actionable next actions
- **Visual Timer**: Shrinking disc with 25/45/50 minute presets
- **Variance Tracking**: Compare planned vs actual time with encouraging feedback
- **Progressive Enhancement**: Core functionality works without AI or authentication
- **ADHD-Optimized**: Reduced motion, high contrast, minimal cognitive overhead
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
4. **Timer Start**: Click "Start Focus Timer" → choose 25/45/50 minutes
5. **Focus Session**: Visual countdown with pause/resume/stop controls
6. **Results**: See variance analysis and encouraging feedback
7. **Dashboard**: Sign in with Google to see analytics and progress tracking

### Testing Offline Mode
- Disconnect internet → timer still works with fallback suggestions
- All core functionality available without authentication

## Architecture

**Tech Stack**: Next.js 14 + Bun (dev) + npm (prod) + Tailwind + Supabase + Google AI

**Key Principle**: Progressive enhancement - timer works immediately, AI enhances the experience

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

- **Session Saving**: Monitor session data persistence and user authentication
- **Authentication Flow**: Track OAuth callback parameters and session creation
- **Dashboard Analytics**: Detailed logging of session queries, data processing, and metrics calculations
  - Session count and data structure validation
  - User authentication status and token handling
  - Statistics computation and personal records calculation

Open browser dev tools to view detailed logs during development. See `docs/testing-guide.md` for specific debugging scenarios and log patterns.

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

**Progressive Enhancement**:
- ✅ Timer works without AI suggestions
- ✅ Timer works without authentication
- ✅ Offline mode provides fallback suggestions
- ✅ High contrast and reduced motion preferences work

**Authentication Flow**:
- ✅ Google OAuth sign-in works
- ✅ Dashboard shows analytics and session history
- ✅ App works fully without signing in

## Deployment

**Vercel/Netlify Ready**: 
- Build: `npm run build`
- Environment: Add Supabase + Google AI keys
- OAuth: Configure redirect URLs in Supabase dashboard