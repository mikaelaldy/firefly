# Dashboard & Analytics System

The Firefly ADHD Focus App includes a comprehensive dashboard system designed to provide users with meaningful insights into their focus patterns while maintaining ADHD-friendly design principles.

## Overview

The dashboard serves as a central hub for users to:
- Track their focus progress over time
- Celebrate achievements and milestones
- Identify patterns in their focus sessions
- Get encouraging, ADHD-specific insights
- Quickly start new focus sessions

## API Endpoint

### GET /api/dashboard/stats

Returns comprehensive analytics for the authenticated user.

**Authentication**: Required (Bearer token or session cookie)

**Response Structure**:
```typescript
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
  recentSessions: Array<{
    id: string;
    goal: string;
    plannedDuration: number; // seconds
    actualDuration: number; // seconds
    completed: boolean;
    variance: number; // percentage
    startedAt: string;
    completedAt?: string;
  }>;
  insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }>;
}
```

## Key Metrics

### Focus Time Tracking
- **Total Focus Time**: Sum of all session durations (including partial sessions - every minute of focus counts!)
- **Average Session Length**: Mean duration of all sessions with recorded time
- **Sessions This Week**: Count of sessions started since the beginning of the current week

### Completion Analytics
- **Completion Rate**: Percentage of started sessions that were completed
- **Variance Tracking**: Difference between planned and actual session duration

### Personal Records
- **Longest Session**: Maximum duration of any completed session
- **Best Week**: Highest total focus time in any single week
- **Current Streak**: Consecutive days with at least one completed session
- **Longest Streak**: Maximum consecutive days achieved historically

## Streak Calculation

The streak system encourages daily focus habits:

### Current Streak
- Calculated by counting consecutive days backwards from today
- Only counts days with at least one completed session
- Resets to 0 if there's a gap in daily activity

### Longest Streak
- Tracks the maximum consecutive days ever achieved
- Calculated by analyzing all historical session data
- Provides long-term motivation and achievement tracking

## Insights System

The dashboard generates contextual insights based on user behavior:

### Celebration Messages
Triggered when users achieve significant milestones:
- Streaks of 3+ days
- Total focus time exceeding 2 hours
- Completion rates of 80% or higher

### Encouragement Messages
Supportive messages for users who need motivation:
- No sessions this week
- Fewer than 3 sessions this week
- General encouragement when no specific triggers apply

### Tips and Recommendations
ADHD-specific advice based on usage patterns:
- Pomodoro technique suggestions for short average sessions
- Confidence-building tips for low completion rates
- Personalized recommendations based on individual patterns

## Component Architecture

### Dashboard Page (`/dashboard`)
- **Authentication Guard**: Redirects unauthenticated users to login
- **Loading States**: Skeleton components while data loads
- **Error Handling**: Graceful fallbacks for API failures

### Core Components

#### DashboardStats
Displays key metrics in an easy-to-scan format:
- Weekly focus time with visual progress indicators
- Completion rate with encouraging context
- Session count with streak information

#### SessionHistory
Shows recent session data:
- Last 10 sessions with goal, duration, and completion status
- Variance indicators (positive/negative)
- Quick access to session details

#### PersonalRecords
Highlights achievements:
- Longest session with celebration context
- Best week performance
- Current and longest streaks with visual indicators

#### ProgressInsights
Contextual messaging system:
- Rotates through relevant insights
- ADHD-friendly positive reinforcement
- Actionable tips and encouragement

#### QuickStart
Prominent call-to-action:
- Large "Start New Session" button
- Quick access to timer presets
- Seamless transition to focus mode

## ADHD-Friendly Design Principles

### Positive Reinforcement
- Celebrates small wins and progress
- Avoids shame or negative comparisons
- Focuses on personal growth over absolute metrics

### Cognitive Load Reduction
- Clean, uncluttered interface
- Essential information prominently displayed
- Progressive disclosure of detailed data

### Motivation Maintenance
- Streak tracking for habit building
- Achievement highlighting
- Encouraging language throughout

### Accessibility Features
- High contrast mode support
- Reduced motion preferences
- Keyboard navigation
- Screen reader compatibility

## Data Privacy & Security

### User Data Protection
- All analytics are user-specific (no cross-user comparisons)
- Row Level Security ensures data isolation
- No sensitive information in analytics processing

### Performance Optimization
- Efficient database queries with proper indexing
- Calculated fields cached for performance
- Minimal data transfer for dashboard updates

## Error Handling

### API Resilience
- Graceful degradation when analytics fail
- Fallback to basic session data
- Clear error messages for users

### Authentication Handling
- Proper token validation
- Session refresh capabilities
- Secure error responses

## Testing Considerations

### Manual QA Checklist
1. **Authentication**: Verify dashboard requires login
2. **Data Accuracy**: Confirm metrics match actual session data
3. **Streak Calculation**: Test consecutive day counting
4. **Insights Generation**: Verify appropriate messages appear
5. **Responsive Design**: Test on mobile and desktop
6. **Loading States**: Confirm skeleton components work
7. **Error States**: Test with network failures

### Unit Testing
- Streak calculation algorithms
- Variance computation
- Insight generation logic
- Date range calculations

## Future Enhancements

### Potential Features
- Weekly/monthly trend charts
- Goal-specific analytics
- Focus time predictions
- Habit strength indicators
- Social features (optional sharing)

### Performance Improvements
- Real-time updates via WebSocket
- Advanced caching strategies
- Predictive data loading
- Background sync capabilities