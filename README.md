# Firefly ADHD Focus App

A Next.js application designed to help users with ADHD manage focus sessions using AI-powered task suggestions and intelligent timer management.

## Features

### Core Timer Functionality
- **Focus Sessions**: 25, 45, or 50-minute timer presets
- **Visual Timer**: Shrinking disc with mm:ss display
- **Session Tracking**: Records planned vs actual duration with variance analysis
- **Progressive Enhancement**: Works offline without AI suggestions

### AI-Powered Task Management
- **Smart Suggestions**: AI generates first steps and next actions for any goal
- **Fallback Support**: Static suggestions when AI is unavailable
- **Buffer Recommendations**: Intelligent time buffer suggestions for deadlines

### Buffer & Deadline Management
- **Deadline Detection**: Automatically identifies when tasks are due soon (within 2 hours)
- **Buffer Suggestions**: Recommends 25% time buffer for urgent tasks
- **If-Then Planning**: Simple contingency planning for task execution
- **Visual Timeline**: Non-interactive timeline showing checkpoints and deadlines

### Authentication & Data Persistence
- **Google OAuth**: Optional sign-in via Supabase
- **Graceful Degradation**: Full functionality without authentication
- **Local State**: Timer works completely offline
- **Cloud Sync**: Authenticated users get cross-device session history

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Supabase account (for authentication and data persistence)
- Google AI Studio API key (for AI suggestions)

### Installation

```bash
# Clone and install dependencies
bun install

# Copy environment template
cp .env.example .env.local

# Configure environment variables (see Configuration section)
# Edit .env.local with your API keys

# Run database setup
bun run setup:db

# Start development server
bun run dev
```

Visit `http://localhost:3000` to use the app.

### Configuration

Create `.env.local` with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Studio Configuration  
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## Architecture

### Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Bun (development), Node.js (production)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **AI**: Google AI Studio (Gemini)

### Project Structure
```
app/                 # Next.js app router pages
├── api/            # API routes (AI suggestions)
├── auth/           # Authentication pages
├── timer/          # Timer interface
└── results/        # Session results

components/         # React components
├── timer/          # Timer-specific components
└── auth/           # Authentication components

lib/                # Utilities and configurations
├── auth/           # Authentication logic
├── supabase/       # Database client
└── timer-utils.ts  # Timer calculations

types/              # TypeScript type definitions
```

## Type System

### Core Types

#### Timer & Sessions
- `TimerState`: Current timer status and timing
- `TimerSession`: Completed session with variance analysis
- `UserPreferences`: User settings and defaults

#### AI Integration
- `SuggestRequest/Response`: AI API contracts
- `DeadlineInfo`: Deadline detection and buffer calculations
- `IfThenPlan`: Contingency planning structure
- `TimelineCheckpoint`: Visual timeline elements

#### Database Models
- `Profile`: User profile and preferences
- `Task`: User goals with AI suggestions
- `Session`: Completed focus sessions
- `Suggestion`: AI-generated recommendations

### Buffer & Deadline System

The app includes intelligent deadline management:

```typescript
interface DeadlineInfo {
  dueDate: Date;
  timeUntilDue: number; // minutes until due
  isSoon: boolean; // true if within 2 hours
  suggestedBuffer: number; // recommended buffer percentage
}
```

**If-Then Planning** helps users prepare for contingencies:
```typescript
interface IfThenPlan {
  condition: string; // "If it's 9 AM and not started"
  action: string; // "warm-up for 10m"
}
```

**Timeline Visualization** shows key checkpoints:
```typescript
interface TimelineCheckpoint {
  time: Date;
  label: string;
  type: 'start' | 'checkpoint' | 'buffer' | 'deadline';
  isAutoSuggested?: boolean;
}
```

## Development

### Commands
```bash
# Development (fast iteration)
bun run dev

# Production build
npm run build && npm run start

# Database operations
bun run setup:db      # Initialize schema
bun run diagnose:auth # Test authentication
bun run verify:auth   # Verify auth setup
```

### Testing
```bash
# Run tests
bun test

# Manual QA checklist
# 1. Enter goal → see AI suggestion placeholder
# 2. Start timer → visual countdown works
# 3. Stop timer → see variance summary
# 4. Check database → session row exists
```

## Deployment

The app is designed for easy deployment on Vercel, Netlify, or similar platforms:

1. **Build**: Uses npm for production stability
2. **Environment**: Configure Supabase and Google AI keys
3. **Database**: Run migrations via Supabase CLI
4. **Auth**: Configure OAuth redirect URLs

## Contributing

This is a lean MVP focused on core ADHD focus management needs. The architecture prioritizes:

- **Progressive Enhancement**: Core features work without dependencies
- **Fast Iteration**: Bun for development speed
- **Graceful Degradation**: AI and auth failures don't break the timer
- **Minimal Complexity**: Essential features only

See `docs/auth-setup.md` for detailed authentication configuration.