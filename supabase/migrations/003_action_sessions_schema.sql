-- Migration: Add action sessions and editable actions tables
-- This migration adds support for V1 Enhanced Next Actions Management feature

-- Create action_sessions table
CREATE TABLE IF NOT EXISTS public.action_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_estimated_time INTEGER, -- in minutes
  actual_time_spent INTEGER DEFAULT 0, -- in minutes
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused'))
);

-- Create editable_actions table
CREATE TABLE IF NOT EXISTS public.editable_actions (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_action_sessions_user_id ON public.action_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_action_sessions_created_at ON public.action_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_sessions_status ON public.action_sessions(status);
CREATE INDEX IF NOT EXISTS idx_editable_actions_session_id ON public.editable_actions(session_id);
CREATE INDEX IF NOT EXISTS idx_editable_actions_order_index ON public.editable_actions(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_editable_actions_completed_at ON public.editable_actions(completed_at);

-- Create triggers for updated_at on action_sessions
CREATE TRIGGER action_sessions_updated_at
  BEFORE UPDATE ON public.action_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security on new tables
ALTER TABLE public.action_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editable_actions ENABLE ROW LEVEL SECURITY;

-- Action sessions policies
-- Users can only access their own action sessions
CREATE POLICY "Users can view own action sessions" ON public.action_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own action sessions" ON public.action_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own action sessions" ON public.action_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own action sessions" ON public.action_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Editable actions policies
-- Users can only access actions for their own sessions
CREATE POLICY "Users can view own editable actions" ON public.editable_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.action_sessions 
      WHERE id = editable_actions.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own editable actions" ON public.editable_actions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.action_sessions 
      WHERE id = editable_actions.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own editable actions" ON public.editable_actions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.action_sessions 
      WHERE id = editable_actions.session_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own editable actions" ON public.editable_actions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.action_sessions 
      WHERE id = editable_actions.session_id 
      AND user_id = auth.uid()
    )
  );