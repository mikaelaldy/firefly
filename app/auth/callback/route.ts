import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  console.log('Auth callback received:', { 
    code: !!code, 
    next, 
    origin, 
    error, 
    errorDescription 
  })

  // Handle OAuth errors from the provider
  if (error) {
    console.error('OAuth provider error:', error, errorDescription)
    return NextResponse.redirect(
      `${origin}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`
    )
  }

  if (code) {
    try {
      const supabase = createServerClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      console.log('Auth exchange result:', { 
        hasSession: !!data.session, 
        hasUser: !!data.user, 
        error: exchangeError?.message 
      })
      
      if (!exchangeError && data.session) {
        console.log('Auth successful, redirecting to:', `${origin}${next}`)
        
        // Create a response with the redirect
        const response = NextResponse.redirect(`${origin}${next}`)
        
        // Set the session cookies manually to ensure they're available immediately
        if (data.session) {
          const maxAge = 100 * 365 * 24 * 60 * 60 // 100 years, never expires
          response.cookies.set('sb-access-token', data.session.access_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
          })
          response.cookies.set('sb-refresh-token', data.session.refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
          })
        }
        
        return response
      }
      
      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError)
        return NextResponse.redirect(
          `${origin}/auth/auth-code-error?error=${encodeURIComponent(exchangeError.message)}`
        )
      }
      
      // No error but no session - this shouldn't happen
      console.warn('No error but no session received')
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=no-session`
      )
      
    } catch (err) {
      console.error('Auth callback exception:', err)
      return NextResponse.redirect(
        `${origin}/auth/auth-code-error?error=unexpected&description=${encodeURIComponent(String(err))}`
      )
    }
  }

  console.log('No auth code provided, redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no-code`)
}