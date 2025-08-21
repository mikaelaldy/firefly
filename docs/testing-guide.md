# Testing Guide - Firefly ADHD Focus App

This document outlines the testing approach for the Firefly app, designed for hackathon scope with minimal but effective testing coverage.

## Testing Strategy

### 1. Unit Testing
We use **Vitest** for unit testing core utility functions, particularly the variance calculation logic which is critical for user feedback.

#### Running Unit Tests
```bash
# Run tests once
bun run test

# Run tests in watch mode
bun run test:watch

# Alternative with npm
npm run test
```

#### Test Coverage
- **Timer utilities**: Variance calculation, time formatting, duration conversion
- **Security utilities**: PII sanitization patterns and masking strategies
- **Core business logic**: Session data processing and user feedback generation
- **Edge cases**: Zero values, negative inputs, precision handling, malformed PII

### 2. Manual QA Testing
For hackathon scope, we rely on comprehensive manual testing of the complete user journey.

#### QA Checklist Location
See `docs/manual-qa-checklist.md` for the complete testing checklist.

#### Key Test Scenarios
1. **Happy Path**: Input → AI suggestions → Timer → Results → Next task
2. **AI Fallback**: Test behavior when AI services are unavailable
3. **Timer Edge Cases**: Pause/resume, browser tab switching, system sleep
4. **Performance**: Timer start latency, AI response times
5. **Accessibility**: Keyboard navigation, screen reader compatibility

## Test Files Structure

```
lib/
  __tests__/
    timer-utils.test.ts     # Unit tests for timer utilities
  security/
    __tests__/
      pii-sanitizer.test.ts # Unit tests for PII sanitization
docs/
  manual-qa-checklist.md    # Manual testing checklist
  testing-guide.md          # This file
```

## Requirements Coverage

### Requirement 9.1-9.4 (User Journey)
- **Manual QA**: Complete end-to-end user journey testing
- **Automated**: Core utility functions that support the journey

### Requirement 3.8 (Performance)
- **Manual QA**: Timer start latency verification (< 1 second)
- **Manual QA**: AI response time monitoring (< 10 seconds)

### Requirement 4.2 (Variance Calculation)
- **Unit Tests**: Comprehensive variance calculation testing
- **Manual QA**: User-facing variance message validation

## Running the Complete Test Suite

### Quick Test Run
```bash
# Run unit tests
bun run test

# Follow manual QA checklist
# See docs/manual-qa-checklist.md
```

### Pre-Release Testing
1. Run unit tests: `bun run test`
2. Start dev server: `bun run dev`
3. Complete manual QA checklist
4. Verify all performance requirements
5. Test accessibility features

## Test Data

### Sample Goals for Testing
Use these consistent test inputs for manual QA:

#### Clean Goals (No PII)
- "Write a blog post about productivity"
- "Clean my desk and organize papers"
- "Review and respond to emails"
- "Study for upcoming presentation"
- "Plan weekend activities"

#### Goals with PII (for security testing)
- "Email john.doe@company.com about the project"
- "Call Sarah at (555) 123-4567 to discuss timeline"
- "Meet client at 123 Main Street for presentation"
- "Send invoice to billing@client.com by Friday"

**Expected Behavior**: PII goals should be sanitized before AI processing while maintaining task context.

### Expected Variance Scenarios
- **Perfect timing**: 25min planned, 25min actual (0% variance)
- **Over time**: 25min planned, 30min actual (+20% variance)
- **Under time**: 25min planned, 20min actual (-20% variance)
- **Small variance**: 25min planned, 26min actual (+4% variance)

## Debugging Test Issues

### Unit Test Failures
- Check timer-utils.ts for any changes to function signatures
- Verify test expectations match actual function behavior
- Run tests in watch mode for rapid iteration

### Manual QA Issues
- Use browser dev tools to inspect network requests
- Check console for JavaScript errors
- Verify environment variables are properly set
- Test in incognito mode to avoid cached state

### Authentication Debugging
The auth callback route provides comprehensive logging for OAuth troubleshooting:

**Console Logs to Monitor:**
- `Auth callback received:` - Shows all OAuth parameters from provider
- `Auth exchange result:` - Displays session creation success/failure
- `OAuth provider error:` - Captures provider-side authentication errors

**Common Auth Test Scenarios:**
- **Valid OAuth Flow**: Check for successful code exchange and session creation
- **Provider Errors**: Test handling of OAuth consent denials or provider issues
- **Missing Parameters**: Verify graceful handling of malformed callback URLs
- **Session Persistence**: Confirm authentication state survives page reloads

**Debug Steps:**
1. Open browser dev tools before starting auth flow
2. Monitor console during OAuth redirect process
3. Look for detailed parameter logging in callback phase
4. Verify error handling displays user-friendly messages

### Session Saving Debugging
The session saving functionality includes comprehensive logging for troubleshooting data persistence:

**Console Logs to Monitor:**
- `saveSession called with:` - Shows input parameters (session data and taskId)
- `saveSession - user check:` - Displays authenticated user ID verification
- `saveSession - attempting to insert:` - Shows formatted data being sent to database
- `saveSession - success:` - Confirms successful database insertion with returned data

**Common Session Saving Test Scenarios:**
- **Authentication State**: Verify user is authenticated before attempting to save
- **Data Formatting**: Confirm TimerSession is properly converted to database format
- **Database Insertion**: Test successful session persistence and error handling
- **Offline Behavior**: Verify graceful handling when database is unavailable

**Debug Steps:**
1. Open browser dev tools before starting a timer session
2. Complete a focus session (start → stop timer)
3. Monitor console logs during session save process
4. Verify session data appears correctly in database/dashboard

### Dashboard Analytics Debugging
The dashboard page includes comprehensive logging for troubleshooting data fetching and analytics:

**Console Logs to Monitor:**
- `Dashboard data received:` - Shows complete API response structure
- `Recent sessions:` - Displays session history data for verification
- `Total focus time:` - Shows calculated focus time metrics

**Common Dashboard Test Scenarios:**
- **Data Loading**: Verify analytics API returns expected data structure
- **Session History**: Confirm recent sessions display correctly with proper variance calculations
- **Metrics Accuracy**: Cross-reference displayed metrics with raw session data
- **Loading States**: Test dashboard behavior during API delays or failures

**Debug Steps:**
1. Open browser dev tools before navigating to dashboard
2. Monitor console logs during dashboard data fetch
3. Verify API response matches expected DashboardStatsResponse interface
4. Check that UI components render data correctly from logged values

## Future Testing Enhancements

For post-hackathon development:
- **Integration tests**: API endpoint testing
- **E2E tests**: Automated user journey testing with Playwright
- **Performance monitoring**: Automated performance regression testing
- **Accessibility automation**: Automated a11y testing with axe-core

## Notes

- This testing approach prioritizes speed and coverage for hackathon constraints
- Focus is on critical user paths and core business logic
- Manual testing ensures real user experience validation
- Unit tests provide confidence in mathematical calculations and edge cases