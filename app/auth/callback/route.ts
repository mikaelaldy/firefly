import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  console.log('Auth callback received:', { 
    code: !!code, 
    next, 
    origin: requestUrl.origin, 
    error, 
    errorDescription,
    fullUrl: request.url
  })

  // Handle OAuth errors from the provider
  if (error) {
    console.error('OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (code) {
    try {
      const supabase = createServerClient()
      
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Auth exchange result:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user, 
        error: exchangeError?.message 
      })
      
      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`
        )
      }
      
      if (data.session) {
        console.log('Auth successful, redirecting to:', `${requestUrl.origin}${next}`)
        
        // Create response with redirect
        const redirectUrl = `${requestUrl.origin}${next}`
        const response = NextResponse.redirect(redirectUrl)
        
        // Set session cookies explicitly to ensure they're available
        const { access_token, refresh_token } = data.session
        
        response.cookies.set('sb-access-token', access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
        
        response.cookies.set('sb-refresh-token', refresh_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
        
        return response
      }
      
      // No session received
      console.warn('No session received after code exchange')
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-code-error?error=no-session`
      )
      
    } catch (err) {
      console.error('Auth callback exception:', err)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-code-error?error=unexpected&description=${encodeURIComponent(String(err))}`
      )
    }
  }

  // No code provided - check if user is already authenticated
  try {
    const supabase = createServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('User already has valid session, redirecting to home')
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  } catch (err) {
    console.warn('Could not check existing session:', err)
  }

  console.log('No auth code provided and no existing session')
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error?error=no-code`)
}