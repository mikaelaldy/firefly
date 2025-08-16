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

## Authentication Features Implemented

✅ **Google OAuth Login**: Users can sign in with their Google account
✅ **Session Management**: Authentication state persists across page reloads
✅ **Graceful Degradation**: App works fully without authentication
✅ **Secure Callbacks**: OAuth redirects handled securely
✅ **Database Integration**: Authenticated operations save to Supabase
✅ **Local Fallback**: Timer and core features work offline/unauthenticated

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