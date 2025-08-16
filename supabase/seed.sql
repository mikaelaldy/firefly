-- Seed script for demo data
-- This script creates sample data for testing and development

-- Note: This assumes you have a test user with a known UUID
-- In a real scenario, you would replace this with actual user IDs from auth.users

-- Insert demo tasks (these will only work if you have authenticated users)
-- The user_id should match actual users from auth.users table

-- Example demo data structure (commented out since it requires real user IDs)
/*
-- Demo task 1: Write a blog post
INSERT INTO public.tasks (user_id, goal, urgency) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Write a blog post about productivity tips', 'medium');

-- Demo task 2: Organize workspace
INSERT INTO public.tasks (user_id, goal, urgency) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Clean and organize my workspace', 'low');

-- Demo task 3: Prepare presentation
INSERT INTO public.tasks (user_id, goal, urgency, due_date) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Prepare presentation for team meeting', 'high', NOW() + INTERVAL '2 days');
*/

-- Create a function to generate demo data for a specific user
CREATE OR REPLACE FUNCTION public.create_demo_data(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  task_1_id UUID;
  task_2_id UUID;
  task_3_id UUID;
BEGIN
  -- Insert demo tasks
  INSERT INTO public.tasks (user_id, goal, urgency) VALUES 
    (target_user_id, 'Write a blog post about productivity tips', 'medium')
    RETURNING id INTO task_1_id;

  INSERT INTO public.tasks (user_id, goal, urgency) VALUES 
    (target_user_id, 'Clean and organize my workspace', 'low')
    RETURNING id INTO task_2_id;

  INSERT INTO public.tasks (user_id, goal, urgency, due_date) VALUES 
    (target_user_id, 'Prepare presentation for team meeting', 'high', NOW() + INTERVAL '2 days')
    RETURNING id INTO task_3_id;

  -- Insert demo suggestions
  INSERT INTO public.suggestions (task_id, user_id, first_step, next_actions, buffer_recommendation) VALUES 
    (task_1_id, target_user_id, 
     '{"description": "Open a new document and write the title", "estimatedSeconds": 60}',
     ARRAY['Brainstorm 3-5 main points', 'Research supporting examples', 'Create an outline', 'Write the introduction'],
     25);

  INSERT INTO public.suggestions (task_id, user_id, first_step, next_actions, buffer_recommendation) VALUES 
    (task_2_id, target_user_id,
     '{"description": "Clear everything off your desk surface", "estimatedSeconds": 60}',
     ARRAY['Sort items into keep/donate/trash piles', 'Wipe down all surfaces', 'Organize desk drawers', 'Set up a filing system'],
     15);

  INSERT INTO public.suggestions (task_id, user_id, first_step, next_actions, buffer_recommendation) VALUES 
    (task_3_id, target_user_id,
     '{"description": "Create a new presentation file and add the title slide", "estimatedSeconds": 60}',
     ARRAY['Outline key points to cover', 'Gather supporting data and charts', 'Create slide templates', 'Practice the opening'],
     30);

  -- Insert demo sessions
  INSERT INTO public.sessions (user_id, task_id, goal, planned_duration, actual_duration, completed, variance, started_at, completed_at) VALUES 
    (target_user_id, task_1_id, 'Write a blog post about productivity tips', 1500, 1680, true, 12.0, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '32 minutes');

  INSERT INTO public.sessions (user_id, task_id, goal, planned_duration, actual_duration, completed, variance, started_at, completed_at) VALUES 
    (target_user_id, task_2_id, 'Clean and organize my workspace', 2700, 2400, true, -11.1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '40 minutes');

END;
$$ LANGUAGE plpgsql;

-- Usage example (commented out):
-- SELECT public.create_demo_data('your-actual-user-id-here');