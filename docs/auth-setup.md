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
   - `http://localhost:3001/auth/callback` (for local development)

### 3. Update Supabase Site URL

In your Supabase project settings:
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL** to your production domain
3. Add **Redirect URLs**:
   - `http://localhost:3001/auth/callback`
   - `https://your-domain.com/auth/callback`

### 4. Test Authentication

1. Start the development server: `bun run dev`
2. Navigate to `http://localhost:3001`
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Verify you're redirected back to the app and see your email displayed

## Authentication Callback Improvements

The auth callback route (`/app/auth/callback/route.ts`) has been enhanced with improved session handling and cookie management:

### Enhanced Session Management
- **Explicit Cookie Setting**: Session tokens are now explicitly set as HTTP-only cookies for better security
- **Improved Error Handling**: More granular error handling with specific error codes and descriptions
- **Better Logging**: Enhanced debug output with full URL logging and clearer session status tracking
- **Robust Fallback**: Graceful handling of edge cases where code exchange succeeds but no session is returned

### Cookie Configuration
The callback now sets secure session cookies with optimal settings:
- **Access Token**: 7-day expiration, HTTP-only, secure in production
- **Refresh Token**: 30-day expiration, HTTP-only, secure in production
- **SameSite Policy**: 'lax' for cross-site compatibility
- **Path**: Root path ('/') for app-wide availability

### Console Logging Features
- **Callback Parameters**: All URL parameters and full request URL
- **Session Exchange**: Detailed success/failure logging with session data
- **Cookie Setting**: Explicit logging of cookie operations
- **Error Details**: Comprehensive error messages with context
- **Redirect Tracking**: Clear logging of redirect destinations and reasons

### Viewing Debug Logs
1. Open browser developer tools (F12)
2. Navigate to Console tab
3. Attempt authentication
4. Look for logs prefixed with "Auth callback received:" and "Auth exchange result:"

### Common Debug Scenarios
- **Missing Code Parameter**: Check if OAuth provider is sending authorization code
- **Exchange Errors**: Verify Supabase configuration and redirect URLs
- **Session Issues**: Check cookie settings and domain configuration
- **Provider Errors**: Review OAuth consent screen and application settings
- **Cookie Problems**: Verify secure context and domain settings

### Example Debug Output
```
Auth callback received: {
  code: true,
  next: "/",
  origin: "http://localhost:3001",
  error: null,
  errorDescription: null,
  fullUrl: "http://localhost:3001/auth/callback?code=abc123..."
}

Auth exchange result: {
  hasSession: true,
  userId: "user-uuid-here",
  error: null
}

Auth successful, redirecting to: http://localhost:3001/
```

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