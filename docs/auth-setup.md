# Authentication Setup Guide

## Supabase Google OAuth Configuration

To enable Google authentication, you need to configure the Google OAuth provider in your Supabase project:

### 1. Configure Google OAuth in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and click to configure
4. Enable the Google provider
5. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret

### 2. Set up Google OAuth Application

If you don't have a Google OAuth application:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
5. Configure the OAuth consent screen
6. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/api/auth/callback` (for local development)
   - `https://your-domain.com/api/auth/callback` (for production)

### 3. Update Supabase Site URL

In your Supabase project settings:
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to your production domain
3. Add **Redirect URLs**:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-domain.com/api/auth/callback`

### 4. Test Authentication

1. Start the development server: `bun run dev`
2. Navigate to `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify you're redirected back to the app and see your email displayed

## Authentication Callback Implementation

The auth callback route (`/app/api/auth/callback/route.ts`) handles the OAuth flow completion with production-ready redirect handling:

### Core Functionality
- **Code Exchange**: Exchanges OAuth authorization code for user session using Supabase Auth
- **Smart Redirects**: Handles both development and production environments with proper host detection
- **Error Handling**: Redirects to error page (`/auth/auth-code-error`) when authentication fails
- **Dashboard Redirect**: Successfully authenticated users are redirected to `/dashboard` for immediate access to their analytics
- **Next Parameter**: Supports custom redirect destinations via `next` query parameter

### Production-Ready Features
- **Load Balancer Support**: Detects `x-forwarded-host` header for proper HTTPS redirects in production
- **Environment Detection**: Different redirect logic for development vs production environments
- **Secure Redirects**: Forces HTTPS in production when behind load balancers
- **Fallback Handling**: Graceful error handling with user-friendly error page

### Redirect Logic
```typescript
// Development: Direct origin redirect
if (isLocalEnv) {
  return NextResponse.redirect(`${origin}${next}`)
}

// Production with load balancer: Use forwarded host
else if (forwardedHost) {
  return NextResponse.redirect(`https://${forwardedHost}${next}`)
}

// Production fallback: Use request origin
else {
  return NextResponse.redirect(`${origin}${next}`)
}
```

### Error Handling
- **Missing Code**: Redirects to `/auth/auth-code-error` when no authorization code is present
- **Exchange Failure**: Redirects to error page when Supabase session exchange fails
- **User-Friendly Errors**: Error page provides clear feedback and troubleshooting tips
- **Success Recovery**: If user is actually authenticated despite error page, automatically redirects to `/dashboard` after 3-second countdown

### Dashboard Authentication Flow
The dashboard page includes enhanced authentication handling to improve user experience after OAuth callbacks:

- **Delayed Redirect**: Waits 1 second before redirecting unauthenticated users to allow OAuth callback processing to complete
- **OAuth Callback Support**: Prevents premature redirects during the OAuth flow completion
- **Graceful Loading**: Shows loading state while authentication status is being determined
- **Automatic Cleanup**: Properly cleans up redirect timers to prevent memory leaks

This improvement addresses timing issues where users might be redirected away from the dashboard before the OAuth callback has fully processed their authentication.

### Cookie Management
Session cookies are managed automatically by the Supabase server client with secure settings:
- **HTTP-Only**: Session tokens inaccessible to client-side JavaScript
- **Secure**: Cookies marked secure in production environments
- **SameSite**: 'lax' policy for cross-site compatibility
- **Path**: Root path ('/') for app-wide availability

## Authentication Features Implemented

✅ **Google OAuth Login**: Users can sign in with their Google account
✅ **Enhanced Session Management**: Improved session persistence with explicit cookie handling
✅ **Secure Cookie Configuration**: HTTP-only cookies with appropriate expiration and security settings
✅ **Graceful Degradation**: App works fully without authentication
✅ **Robust Error Handling**: Comprehensive error handling for all OAuth failure scenarios
✅ **Enhanced Debugging**: Detailed callback logging with full request context
✅ **Database Integration**: Authenticated operations save to Supabase
✅ **Local Fallback**: Timer and core features work offline/unauthenticated

### Security Improvements
- **HTTP-Only Cookies**: Session tokens stored securely, inaccessible to client-side JavaScript
- **Secure Context**: Cookies marked secure in production environments
- **SameSite Protection**: CSRF protection with 'lax' SameSite policy
- **Appropriate Expiration**: Different expiration times for access (7 days) and refresh tokens (30 days)

## Requirements Satisfied

- **6.1**: Supabase Google OAuth login option implemented
- **6.3**: App functions fully without login (timer + local state)
- Authentication failures allow continued use without login
- Prepared for future cloud sync capabilities

## Debugging Authentication

The authentication system includes comprehensive console logging for development and troubleshooting:

### Auth Context Logging

The `AuthProvider` component includes detailed logging for authentication state changes:

- **Initial Session Check**: Logs session availability, errors, and user email on app startup
- **Auth State Changes**: Monitors all authentication events (sign-in, sign-out, token refresh)
- **Error Tracking**: Captures and logs authentication errors with context

**Console Output Examples:**
```javascript
// Initial session check
Auth context - Initial session check: { session: true, error: null, userEmail: "user@example.com" }

// Authentication state changes
Auth context - Auth state change: { event: "SIGNED_IN", session: true, userEmail: "user@example.com" }
Auth context - Auth state change: { event: "SIGNED_OUT", session: false, userEmail: undefined }
```

### Debugging Steps

1. **Open Browser Dev Tools**: Press F12 or right-click → Inspect
2. **Navigate to Console Tab**: View authentication logs in real-time
3. **Test Authentication Flow**: Sign in/out and monitor console output
4. **Check for Errors**: Look for error messages with context details

### Common Debug Scenarios

- **Session Not Loading**: Check for "Initial session check" log with error details
- **OAuth Callback Issues**: Monitor auth state changes during redirect flow
- **Token Refresh Problems**: Watch for automatic token refresh events
- **Sign-out Issues**: Verify "SIGNED_OUT" event appears in console

## Usage in Components

```typescript
import { useAuth } from '@/lib/auth/context'
import { useAuthenticatedOperations } from '@/lib/auth/hooks'

function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  const { saveTask, saveSession } = useAuthenticatedOperations()
  
  // Save data if authenticated, continue with local state if not
  const handleSave = async (data) => {
    const saved = await saveTask(data.goal)
    if (!saved) {
      // Handle local state fallback
      setLocalState(data)
    }
  }
}
```