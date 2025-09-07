# Migration 003: Action Sessions Schema

## Overview

This migration adds support for the V1 Enhanced Next Actions Management feature by creating two new tables:

- `action_sessions`: Stores user action sessions with goals and time tracking
- `editable_actions`: Stores individual actions within sessions with AI estimates

## Tables Created

### action_sessions

Stores action sessions that group related tasks and track overall progress.

```sql
CREATE TABLE public.action_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_estimated_time INTEGER, -- in minutes
  actual_time_spent INTEGER DEFAULT 0, -- in minutes
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'))
);
```

**Columns:**
- `id`: Primary key (UUID)
- `user_id`: Foreign key to auth.users (with CASCADE delete)
- `goal`: User's main goal for this session
- `total_estimated_time`: Sum of all action estimates (minutes)
- `actual_time_spent`: Actual time spent on session (minutes)
- `status`: Session status (active, completed, paused)
- `created_at`, `updated_at`: Timestamps

### editable_actions

Stores individual actions within sessions, including AI estimates and user modifications.

```sql
CREATE TABLE public.editable_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.action_sessions(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  estimated_minutes INTEGER,
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high')),
  is_custom BOOLEAN DEFAULT FALSE,
  original_text TEXT,
  order_index INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Columns:**
- `id`: Primary key (UUID)
- `session_id`: Foreign key to action_sessions (with CASCADE delete)
- `text`: Action description (editable by user)
- `estimated_minutes`: AI-generated time estimate
- `confidence`: AI confidence level (low, medium, high)
- `is_custom`: True if user modified the action
- `original_text`: Original AI-generated text (for tracking changes)
- `order_index`: Display order within session
- `completed_at`: Timestamp when action was completed
- `created_at`: Creation timestamp

## Indexes Created

Performance indexes for common query patterns:

```sql
-- Action sessions indexes
CREATE INDEX idx_action_sessions_user_id ON public.action_sessions(user_id);
CREATE INDEX idx_action_sessions_created_at ON public.action_sessions(created_at DESC);
CREATE INDEX idx_action_sessions_status ON public.action_sessions(status);

-- Editable actions indexes
CREATE INDEX idx_editable_actions_session_id ON public.editable_actions(session_id);
CREATE INDEX idx_editable_actions_order_index ON public.editable_actions(session_id, order_index);
CREATE INDEX idx_editable_actions_completed_at ON public.editable_actions(completed_at);
```

## Row Level Security (RLS)

Both tables have RLS enabled with policies that ensure users can only access their own data:

### action_sessions policies:
- Users can view, insert, update, and delete their own action sessions
- Access controlled by `auth.uid() = user_id`

### editable_actions policies:
- Users can view, insert, update, and delete actions for their own sessions
- Access controlled through session ownership verification

## Application Instructions

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `003_action_sessions_schema.sql`
4. Execute the migration

### Option 2: Supabase CLI

```bash
# If you have the CLI set up
supabase db push
```

### Option 3: Manual Application

Execute the SQL file directly against your database:

```bash
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/003_action_sessions_schema.sql
```

## Verification

After applying the migration, you can verify it worked by running:

```bash
bun run scripts/verify-action-sessions-schema.js
```

This script will:
- ✅ Verify both tables exist and are accessible
- ✅ Test table relationships work correctly
- ✅ Confirm RLS policies are active

## Demo Data

To add sample data for testing, use the seed function:

```sql
-- Replace with actual user UUID from auth.users
SELECT public.create_action_sessions_demo_data('your-user-uuid-here');
```

This creates:
- 2 sample action sessions (1 completed, 1 active)
- 7 sample editable actions with various states
- Realistic time estimates and completion data

## Usage in Application

### Creating an Action Session

```typescript
const { data: session } = await supabase
  .from('action_sessions')
  .insert({
    goal: 'Complete project documentation',
    total_estimated_time: 120,
    status: 'active'
  })
  .select()
  .single();
```

### Adding Actions to Session

```typescript
const actions = [
  {
    session_id: session.id,
    text: 'Review existing docs',
    estimated_minutes: 30,
    confidence: 'high',
    order_index: 1
  },
  // ... more actions
];

const { data: createdActions } = await supabase
  .from('editable_actions')
  .insert(actions)
  .select();
```

### Querying Session with Actions

```typescript
const { data: sessionWithActions } = await supabase
  .from('action_sessions')
  .select(`
    *,
    editable_actions (*)
  `)
  .eq('id', sessionId)
  .single();
```

## Requirements Satisfied

This migration satisfies the following requirements:

- **12.11**: Action session tracking with estimated vs actual time
- **12.12**: Dashboard integration for action tracking and time estimation accuracy

## Next Steps

After applying this migration, you can:

1. Implement the EditableNextActions component
2. Create the AI time estimation API endpoint
3. Build the enhanced timer with custom durations
4. Update the dashboard to show action session data

## Rollback

If you need to rollback this migration:

```sql
-- Drop tables (this will cascade to delete all data)
DROP TABLE IF EXISTS public.editable_actions;
DROP TABLE IF EXISTS public.action_sessions;

-- Drop the demo data function
DROP FUNCTION IF EXISTS public.create_action_sessions_demo_data(UUID);
```

**⚠️ Warning**: Rollback will permanently delete all action session data.