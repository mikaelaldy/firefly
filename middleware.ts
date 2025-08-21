import { createServerClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient()
    
    // Refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser()
    
    // If we have a user, ensure the session is fresh
    if (user) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Session is valid, continue
        console.log('Middleware: Valid session for user', user.id)
      }
    }
  } catch (error) {
    // If there's an error, continue without auth
    console.error('Middleware auth error:', error)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}