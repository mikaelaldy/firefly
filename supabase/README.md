# Supabase Database Schema

This directory contains the database schema and migrations for the Firefly ADHD Focus App.

## Files

- `migrations/001_initial_schema.sql` - Creates the main database tables and indexes
- `migrations/002_rls_policies.sql` - Sets up Row Level Security policies
- `seed.sql` - Optional demo data for testing and development

## Database Schema

### Tables

#### `profiles`
Extends the auth.users table with additional user information and preferences.
- `id` (UUID, PK) - References auth.users(id)
- `email` (TEXT) - User email
- `full_name` (TEXT) - User's full name
- `avatar_url` (TEXT) - Profile picture URL
- `preferences` (JSONB) - User preferences (timer defaults, accessibility settings)
- `created_at`, `updated_at` (TIMESTAMP)

#### `tasks`
Stores user goals and tasks.
- `id` (UUID, PK) - Auto-generated
- `user_id` (UUID, FK) - References auth.users(id)
- `goal` (TEXT) - The user's goal or task description
- `due_date` (TIMESTAMP) - Optional deadline
- `urgency` (TEXT) - 'low', 'medium', or 'high'
- `created_at`, `updated_at` (TIMESTAMP)

#### `suggestions`
Stores AI-generated task breakdowns and suggestions.
- `id` (UUID, PK) - Auto-generated
- `task_id` (UUID, FK) - References tasks(id)
- `user_id` (UUID, FK) - References auth.users(id)
- `first_step` (JSONB) - The 60-second first step with description and estimated time
- `next_actions` (TEXT[]) - Array of follow-up actions
- `buffer_recommendation` (INTEGER) - Suggested time buffer percentage
- `fallback_used` (BOOLEAN) - Whether AI fallback was used
- `created_at` (TIMESTAMP)

#### `sessions`
Tracks timer sessions and time variance analysis.
- `id` (UUID, PK) - Auto-generated
- `user_id` (UUID, FK) - References auth.users(id)
- `task_id` (UUID, FK) - References tasks(id)
- `goal` (TEXT) - Copy of the goal for this session
- `planned_duration` (INTEGER) - Planned time in seconds
- `actual_duration` (INTEGER) - Actual time spent in seconds
- `completed` (BOOLEAN) - Whether the session was completed
- `variance` (DECIMAL) - Percentage difference between planned and actual
- `started_at`, `completed_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- All operations (SELECT, INSERT, UPDATE, DELETE) are restricted to the authenticated user
- Data isolation is enforced at the database level

## Applying Migrations

### Option 1: Supabase CLI (Recommended)
If you have the Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

### Option 2: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order:
   - First: `001_initial_schema.sql`
   - Second: `002_rls_policies.sql`
4. Execute each migration

### Option 3: Direct SQL Execution
Connect to your Supabase database and execute the SQL files in order.

## Demo Data

To create demo data for testing:

1. First, ensure you have an authenticated user in your system
2. Get the user's UUID from the auth.users table
3. Execute the seed function:

```sql
SELECT public.create_demo_data('your-user-uuid-here');
```

This will create sample tasks, suggestions, and sessions for testing the application.

## Security Notes

- All tables use Row Level Security (RLS) to ensure data isolation
- The `handle_new_user()` function automatically creates a profile when a user signs up
- User data is strictly isolated - users can only access their own records
- The database follows the principle of least privilege

## Requirements Satisfied

This schema implementation satisfies the following requirements:
- **6.1**: Supabase integration with proper authentication
- **8.1**: Row Level Security policies for data isolation
- **8.3**: Privacy protection through RLS and secure data handling