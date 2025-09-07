# Design Document

## Overview

Firefly is architected as a lightweight, client-side focused Next.js application optimized for ADHD users who need immediate task initiation without cognitive overhead. The design prioritizes minimal latency, distraction-free interfaces, and progressive enhancement to ensure core functionality works even when AI services are unavailable.

The application follows a simple request-response pattern with server-side AI integration, client-side timer management, and session-based data storage to maintain privacy while providing immediate feedback and guidance.

## Architecture

### Technology Stack
- **Frontend Framework**: Next.js 14+ with App Router
- **Runtime**: Bun (development) with npm fallback for CI/production
- **Styling**: Tailwind CSS for rapid, consistent styling
- **AI Integration**: Google AI Studio SDK (@google/genai) (Gemini Flash with Flash-Lite fallback)
- **Authentication**: Supabase Auth with Google OAuth provider (optional)
- **State Management**: React hooks and context for timer and session state
- **Database**: Supabase (tasks, suggestions, sessions persisted with RLS)

### System Architecture

```mermaid
graph TB
    A[User Interface] --> B[Next.js App Router]
    B --> C[API Routes]
    C --> D[Google AI Studio SDK]
    C --> E[Supabase Database]
    B --> F[Client Components]
    F --> G[Timer Engine]
    F --> H[State Management]
    F --> N[Action Editor]
    
    subgraph "External Services"
        D --> I[Gemini 2.0 Flash]
        D --> J[Gemini Flash-Lite]
    end
    
    subgraph "Client State"
        G --> K[Timer State]
        H --> L[Session Data]
        H --> M[User Preferences]
        N --> O[Editable Actions]
    end
    
    subgraph "V1 Features"
        N --> P[AI Time Estimation]
        O --> Q[Custom Timer Durations]
        E --> R[Action Session Tracking]
    end
```

### Request Flow
1. User submits goal → API route → Google AI Studio SDK → Response streams back
2. Timer operations handled entirely client-side for <1s responsiveness
3. Session data stored in Supabase with user authentication
4. **V1 Enhancement Flow**:
   - User edits next actions → Client state updates immediately
   - User clicks "Update with AI" → `/api/ai/estimate` → Time estimates returned
   - User selects action → Timer starts with estimated duration
   - Session progress synced to dashboard in real-time

## Components and Interfaces

### Core Components

#### 1. Enhanced Landing Page (`/`)
- **HeroSection Component**: Compelling tagline and value proposition display
- **FeatureShowcase Component**: Visual feature highlights with ADHD-specific benefits
- **DemoPreview Component**: Screenshots or quick demo of timer interface
- **CallToAction Component**: Prominent "Try Firefly Now" button with smooth transition
- **TaskInput Component**: Centered input field with submit handling (embedded in CTA flow)
- **AIResponse Component**: Displays first step and next actions
- **EditableNextActions Component** (New V1): Inline editing, deletion, and AI re-estimation of next actions
- **TimerLauncher Component**: Preset selection and immediate start capability

#### 2. Timer Interface (`/focus`)
- **VisualTimer Component**: Shrinking disc with mm:ss display
- **TimerControls Component**: Pause/resume/stop functionality
- **ProgressIndicator Component**: Visual progress representation

#### 3. Results Interface (`/complete`)
- **VarianceSummary Component**: Friendly comparison of planned vs actual
- **BufferSuggestion Component**: Optional deadline management tips
- **NextTaskPrompt Component**: Seamless return to task input

#### 4. User Dashboard (`/dashboard`)
- **DashboardStats Component**: Weekly focus time, average session length, completion rate
- **SessionHistory Component**: Last 10 sessions with goals, durations, and variance
- **PersonalRecords Component**: Longest session, best week, streak days highlights
- **ProgressInsights Component**: Encouraging analytics with ADHD-friendly language
- **QuickStart Component**: Prominent "Start New Session" button
- **OnboardingMessage Component**: Encouraging tips for new users with no data

### API Interfaces

#### `/api/ai/suggest`
```typescript
interface SuggestRequest {
  goal: string;
  dueDate?: string;
  urgency?: 'low' | 'medium' | 'high';
}

interface SuggestResponse {
  firstStep: {
    description: string;
    estimatedSeconds: number;
  };
  nextActions: string[];
  bufferRecommendation?: number;
  fallbackUsed?: boolean;
}
```

#### `/api/ai/estimate` (New V1 Feature)
```typescript
interface EstimateRequest {
  actions: string[];
  context?: string;
}

interface EstimateResponse {
  estimatedActions: {
    action: string;
    estimatedMinutes: number;
    confidence: 'low' | 'medium' | 'high';
  }[];
  totalEstimatedTime: number;
}
```

#### `/api/auth/session`
```typescript
interface SessionData {
  userId?: string;
  preferences: {
    soundEnabled: boolean;
    defaultDuration: number;
    highContrast: boolean;
  };
}
```

#### `/api/dashboard/stats`
```typescript
interface DashboardStatsRequest {
  userId: string;
  timeframe?: 'week' | 'month' | 'all';
}

interface DashboardStatsResponse {
  totalFocusTime: number; // in minutes
  averageSessionLength: number; // in minutes
  completionRate: number; // percentage
  sessionsThisWeek: number;
  personalRecords: {
    longestSession: number; // in minutes
    bestWeek: number; // total minutes
    currentStreak: number; // days
    longestStreak: number; // days
  };
  recentSessions: TimerSession[];
  insights: {
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }[];
}
```

### State Management Interfaces

#### Timer State
```typescript
interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  remaining: number;
  startTime: Date;
  plannedDuration: number;
}
```

#### Session State
```typescript
interface SessionState {
  currentGoal: string;
  aiSuggestions: SuggestResponse | null;
  timerHistory: TimerSession[];
  preferences: UserPreferences;
}
```

## Data Models

### Timer Session
```typescript
interface TimerSession {
  id: string;
  goal: string;
  plannedDuration: number; // seconds
  actualDuration: number; // seconds
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  variance: number; // percentage difference
}
```

### User Preferences
```typescript
interface UserPreferences {
  defaultTimerDuration: 25 | 45 | 50; // minutes
  soundEnabled: boolean;
  tickSoundEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  bufferPercentage: number; // default 25%
}
```

### AI Suggestion Cache
```typescript
interface SuggestionCache {
  goal: string;
  response: SuggestResponse;
  timestamp: Date;
  expiresAt: Date; // 1 hour cache
}
```

### Enhanced Next Actions (V1 Feature)
```typescript
interface EditableAction {
  id: string;
  text: string;
  estimatedMinutes?: number;
  confidence?: 'low' | 'medium' | 'high';
  isCustom: boolean; // true if user-modified
  originalText?: string; // for tracking changes
}

interface ActionSession {
  sessionId: string;
  goal: string;
  actions: EditableAction[];
  completedActions: string[];
  currentActionId?: string;
  totalEstimatedTime: number;
  actualTimeSpent: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Dashboard Analytics
```typescript
interface UserAnalytics {
  userId: string;
  totalSessions: number;
  totalFocusTime: number; // in minutes
  averageSessionLength: number;
  completionRate: number;
  longestSession: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  weeklyStats: {
    week: string; // ISO week format
    totalTime: number;
    sessionCount: number;
  }[];
}
```

## Error Handling

### AI Service Failures
- **Primary Strategy**: Graceful degradation with fallback suggestions
- **Fallback Chain**: Gemini Flash → Flash-Lite → Static suggestions
- **User Experience**: Always allow timer start regardless of AI status

### Rate Limiting
- **Detection**: Monitor rate limit responses from Google AI Studio
- **Response**: Automatic fallback to Flash-Lite or cached suggestions
- **User Feedback**: Subtle notification without blocking workflow

### Network Issues
- **Offline Mode**: Timer functionality works without network
- **Progressive Enhancement**: Core features available without AI
- **Retry Logic**: Exponential backoff for API calls

### Timer Accuracy
- **Browser Tab Visibility**: Handle background tab timer drift
- **System Sleep**: Detect and adjust for system sleep/wake
- **Precision**: Use performance.now() for sub-second accuracy

## Testing Strategy

### Testing Strategy (Lean MVP)
- **Manual QA**: Complete user journey testing from goal input to session completion
- **Unit Testing**: Core utility functions (variance calculations, time formatting)
- **Accessibility**: Manual keyboard navigation and screen reader validation
- **Performance**: Manual validation of <1s timer start requirement

## V1 Feature: Enhanced Next Actions Management

### Component Design

#### EditableNextActions Component
- **Inline Editing**: Click-to-edit functionality for each action
- **Delete Actions**: Remove button with confirmation for each action
- **Add Actions**: Allow users to add custom actions to the list
- **AI Re-estimation**: "Update with AI" button to get time estimates
- **Visual Feedback**: Loading states during AI estimation calls

#### ActionTimer Component
- **Custom Durations**: Use AI-estimated time as timer duration
- **Action Context**: Display current action being worked on
- **Progress Tracking**: Mark actions as complete during timer sessions

### Database Schema Extensions

#### action_sessions Table
```sql
CREATE TABLE action_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_estimated_time INTEGER, -- in minutes
  actual_time_spent INTEGER DEFAULT 0, -- in minutes
  status TEXT DEFAULT 'active' -- 'active', 'completed', 'paused'
);
```

#### editable_actions Table
```sql
CREATE TABLE editable_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES action_sessions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  estimated_minutes INTEGER,
  confidence TEXT, -- 'low', 'medium', 'high'
  is_custom BOOLEAN DEFAULT FALSE,
  original_text TEXT,
  order_index INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### AI Integration Enhancement

#### Time Estimation Prompt
```
Given these action items: [actions]
For each action, provide a realistic time estimate in minutes for an ADHD user who may need extra time for task switching and focus building.

Consider:
- Task complexity and cognitive load
- Potential for hyperfocus or distraction
- Buffer time for transitions
- ADHD-friendly time estimates (slightly longer than neurotypical estimates)

Return estimates with confidence levels.
```

## Security Considerations

### Data Privacy
- **Supabase RLS**: Row Level Security policies for user data isolation
- **AI Calls**: Strip personal identifiers before sending to Google AI Studio
- **Session Security**: Use secure session tokens for authenticated users
- **Action Data**: User-modified actions stored securely with RLS policies

### API Security
- **Rate Limiting**: Implement per-IP and per-user rate limits
- **Input Validation**: Sanitize all user inputs before AI processing
- **CORS**: Restrict API access to application domain
- **Action Validation**: Validate action text length and content before AI estimation

### Authentication Security
- **OAuth Flow**: Secure Google OAuth implementation with Supabase Auth
- **Session Management**: Secure session handling with proper expiration
- **CSRF Protection**: Built-in Next.js CSRF protection for API routes