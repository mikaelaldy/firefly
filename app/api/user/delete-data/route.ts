import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    
    // Verify the user token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('User data deletion - Auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('Deleting all data for user:', userId)

    // Delete user data in order (respecting foreign key constraints)
    // 1. Delete sessions first
    const { error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('user_id', userId)

    if (sessionsError) {
      console.error('Error deleting sessions:', sessionsError)
      throw new Error('Failed to delete sessions')
    }

    // 2. Delete suggestions
    const { error: suggestionsError } = await supabaseAdmin
      .from('suggestions')
      .delete()
      .eq('user_id', userId)

    if (suggestionsError) {
      console.error('Error deleting suggestions:', suggestionsError)
      throw new Error('Failed to delete suggestions')
    }

    // 3. Delete tasks
    const { error: tasksError } = await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('user_id', userId)

    if (tasksError) {
      console.error('Error deleting tasks:', tasksError)
      throw new Error('Failed to delete tasks')
    }

    // 4. Delete profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      throw new Error('Failed to delete profile')
    }

    // 5. Delete the auth user (this will cascade delete everything else)
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (userError) {
      console.error('Error deleting user:', userError)
      throw new Error('Failed to delete user account')
    }

    console.log('Successfully deleted all data for user:', userId)

    return NextResponse.json({ 
      success: true,
      message: 'All user data has been permanently deleted'
    })

  } catch (error) {
    console.error('User data deletion API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}