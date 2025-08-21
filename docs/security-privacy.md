# Security & Privacy Implementation

This document outlines the security and privacy measures implemented in Firefly to protect user data and ensure safe AI interactions.

## PII Protection

### Overview
Firefly implements comprehensive PII (Personally Identifiable Information) sanitization to ensure that sensitive user data is never sent to external AI services.

### Implementation
- **Location**: `lib/security/pii-sanitizer.ts`
- **Usage**: Automatically applied to all goal text before sending to Google AI Studio
- **Coverage**: Detects and sanitizes:
  - Email addresses (partial masking: `j******e@example.com`)
  - Phone numbers (partial masking: `***-***-1234`)
  - Social Security Numbers (complete masking)
  - Credit card numbers (complete masking)
  - Personal names in introductions ("my name is John" → "my name is ****")
  - Physical addresses (street addresses)
  - IP addresses (complete masking)
  - Personal URLs containing profile/user/account paths

### Core Functions

#### `sanitizePII(text: string, maskingChar?: string): SanitizationResult`
Main sanitization function that processes text and returns:
- `sanitizedText`: The cleaned text safe for AI processing
- `piiFound`: Boolean indicating if PII was detected
- `piiTypes`: Array of PII types found (e.g., ['email', 'phone'])

#### `isTextSafeForAI(text: string): boolean`
Quick validation function that returns `true` if text contains no detectable PII.

#### `prepareGoalForAI(goalText: string): string`
Production function used by the AI API that:
1. Sanitizes the goal text
2. Logs PII detection events (without logging actual PII)
3. Returns sanitized text ready for AI processing

### How It Works
1. When a user submits a goal, the text is processed by `prepareGoalForAI()`
2. Multiple regex patterns scan for different PII types
3. Detected PII is masked using intelligent strategies:
   - **Emails**: Show first/last character of local part (`j******e@domain.com`)
   - **Phones**: Show last 4 digits (`***-***-1234`)
   - **Other PII**: Complete masking with length preservation
4. Only the sanitized version is sent to AI services
5. Original goal text is stored in the database for the user's reference
6. PII detection events are logged for security monitoring

### Example Transformations
```typescript
// Email addresses
"Contact john.doe@company.com" → "Contact j******e@company.com"

// Phone numbers  
"Call me at (555) 123-4567" → "Call me at ***-***-4567"

// Personal introductions
"Hi, my name is Sarah Johnson" → "Hi, my name is *****"

// Addresses
"Meet at 123 Main Street" → "Meet at **********"

// Multiple PII types
"I'm John, email me at john@test.com or call (555) 123-4567"
→ "I'm ****, email me at j***@test.com or call ***-***-4567"
```

## Row Level Security (RLS)

### Database Security
All Supabase tables implement Row Level Security policies to ensure users can only access their own data.

### Implemented Policies

#### Profiles Table
- Users can view, insert, and update only their own profile
- Automatic profile creation on user signup

#### Tasks Table
- Users can perform all CRUD operations only on their own tasks
- Tasks are isolated by `user_id`

#### Suggestions Table
- Users can access suggestions only for their own tasks
- Linked to tasks through `task_id` and `user_id`

#### Sessions Table
- Users can access only their own focus sessions
- Complete isolation of session data

### Verification
Run the RLS verification script to test policies:
```bash
node scripts/verify-rls-policies.js
```

This script tests:
- Anonymous access (should be blocked)
- Cross-user access (should be blocked)
- Self-access (should work)
- RLS status verification

## API Security

### Rate Limiting
- **Implementation**: In-memory rate limiting per IP address
- **Limits**: 10 requests per minute per IP
- **Fallback**: Static suggestions when rate limited

### Input Validation
- All API inputs are validated for type and content
- Goal text must be non-empty string
- Malformed requests return appropriate error codes

### Error Handling
- Sensitive error details are not exposed to clients
- Fallback mechanisms ensure service availability
- All errors are logged server-side for monitoring

## Authentication Security

### Supabase Auth Integration
- Google OAuth provider for secure authentication
- JWT tokens for session management
- Automatic session expiration and refresh

### Optional Authentication
- App functions fully without authentication
- Timer and core features work offline
- Data persistence only available for authenticated users

### Session Security
- **HTTP-Only Cookies**: Session tokens stored as HTTP-only cookies, preventing XSS attacks
- **Secure Cookie Configuration**: Cookies marked secure in production environments
- **SameSite Protection**: CSRF protection with 'lax' SameSite policy for cross-site compatibility
- **Token Expiration**: Differentiated expiration times (access: 7 days, refresh: 30 days)
- **Explicit Cookie Management**: Enhanced callback route explicitly sets session cookies for reliable authentication
- **CSRF Protection**: Built into Next.js framework
- **Automatic Token Refresh**: Seamless session renewal handling

## Environment Security

### Environment Variables
Required environment variables are documented in `.env.example`:

```bash
# Public (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Private (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

### Key Management
- Service role keys are never exposed to client-side code
- API keys are stored as environment variables
- No hardcoded secrets in the codebase

## Data Handling

### Data Minimization
- Only essential data is collected and stored
- PII is stripped from AI requests
- Session data is automatically cleaned up

### Data Storage
- User data is stored in Supabase with encryption at rest
- RLS policies ensure data isolation
- No sensitive data in client-side storage

### Data Retention
- Session data is kept for user analytics
- Users can delete their data through account deletion
- No indefinite data retention

## Privacy Compliance

### User Control
- Users control their data through authentication
- App works without data collection (anonymous mode)
- Clear data usage in privacy documentation

### Transparency
- Open source implementation allows code review
- Clear documentation of data handling practices
- No hidden data collection or tracking

## Security Testing

### Automated Tests
- Unit tests for PII sanitization (`lib/security/__tests__/`)
- RLS policy verification script
- Integration tests for authentication flow

### PII Sanitization Testing
The PII sanitizer includes comprehensive test coverage for:
- **Pattern Detection**: Validates all PII regex patterns work correctly
- **Masking Strategies**: Tests different masking approaches for each PII type
- **Edge Cases**: Handles empty strings, null values, and malformed input
- **Performance**: Ensures sanitization doesn't impact API response times
- **False Positives**: Minimizes over-sanitization of legitimate content

Test the sanitizer manually:
```typescript
import { sanitizePII, prepareGoalForAI } from '@/lib/security/pii-sanitizer';

// Test basic sanitization
const result = sanitizePII("Email me at john@example.com");
console.log(result.sanitizedText); // "Email me at j***@example.com"
console.log(result.piiTypes); // ["email"]

// Test AI preparation (production function)
const safeText = prepareGoalForAI("Call John at (555) 123-4567 about the project");
console.log(safeText); // "Call John at ***-***-4567 about the project"
```

### Manual Testing
- Regular security reviews of code changes
- Manual testing of authentication flows
- Verification of RLS policies in production

### Monitoring
- Server-side logging of security events
- Rate limiting monitoring
- Error tracking for security issues

## Incident Response

### Security Issues
1. Immediate assessment of impact
2. Temporary mitigation if needed
3. Code fix and testing
4. Deployment and verification
5. User notification if data affected

### Reporting
Security issues can be reported through:
- GitHub issues (for non-sensitive issues)
- Direct contact for sensitive security concerns

## Compliance Notes

### GDPR Considerations
- Data minimization principles followed
- User consent for data processing
- Right to data deletion supported
- Clear privacy documentation

### CCPA Considerations
- No sale of personal information
- Clear data usage disclosure
- User control over data collection

This implementation ensures that Firefly maintains strong security and privacy protections while providing a seamless user experience for ADHD users who need immediate, distraction-free task guidance.