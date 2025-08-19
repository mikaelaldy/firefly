// Timer-related types
export interface TimerState {
  isActive: boolean;
  isPaused: boolean;
  duration: number; // in seconds
  remaining: number;
  startTime: Date;
  plannedDuration: number;
}

export interface TimerSession {
  id: string;
  goal: string;
  plannedDuration: number; // seconds
  actualDuration: number; // seconds
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  variance: number; // percentage difference
}

// User preferences
export interface UserPreferences {
  defaultTimerDuration: 25 | 45 | 50; // minutes
  soundEnabled: boolean;
  tickSoundEnabled: boolean;
  highContrastMode: boolean;
  reducedMotion: boolean;
  bufferPercentage: number; // default 25%
}

// AI API types
export interface SuggestRequest {
  goal: string;
  dueDate?: string;
  urgency?: 'low' | 'medium' | 'high';
}

export interface SuggestResponse {
  firstStep: {
    description: string;
    estimatedSeconds: number;
  };
  nextActions: string[];
  bufferRecommendation?: number;
  fallbackUsed?: boolean;
}

// Database types
export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal: string;
  due_date?: string;
  urgency: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  suggestions?: SuggestResponse; // AI suggestions for the task
}

export interface Suggestion {
  id: string;
  task_id: string;
  user_id: string;
  first_step: {
    description: string;
    estimatedSeconds: number;
  };
  next_actions: string[];
  buffer_recommendation?: number;
  fallback_used: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  task_id: string;
  goal: string;
  planned_duration: number; // seconds
  actual_duration?: number; // seconds
  completed: boolean;
  variance?: number; // percentage difference
  started_at: string;
  completed_at?: string;
  created_at: string;
}