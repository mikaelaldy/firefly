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

// AI Time Estimation API types
export interface EstimateRequest {
  actions: string[];
  context?: string;
}

export interface EstimateResponse {
  estimatedActions: {
    action: string;
    estimatedMinutes: number;
    confidence: 'low' | 'medium' | 'high';
  }[];
  totalEstimatedTime: number;
}

// Buffer and deadline types
export interface DeadlineInfo {
  dueDate: Date;
  timeUntilDue: number; // minutes
  isSoon: boolean; // within 2 hours
  suggestedBuffer: number; // percentage (25% default)
}

export interface IfThenPlan {
  condition: string; // e.g., "If it's 9 AM and not started"
  action: string; // e.g., "warm-up for 10m"
}

export interface TimelineCheckpoint {
  time: Date;
  label: string;
  type: 'start' | 'checkpoint' | 'buffer' | 'deadline';
  isAutoSuggested?: boolean;
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

// Enhanced Next Actions types (V1 Feature)
export interface EditableAction {
  id: string;
  text: string;
  estimatedMinutes?: number;
  confidence?: 'low' | 'medium' | 'high';
  isCustom: boolean; // true if user-modified
  originalText?: string; // for tracking changes
}

export interface ActionSession {
  sessionId: string;
  goal: string;
  actions: EditableAction[];
  completedActions: string[];
  currentActionId?: string;
  totalEstimatedTime: number;
  actualTimeSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

// Database-specific types for action sessions
export interface ActionSessionRecord {
  id: string;
  user_id: string;
  goal: string;
  created_at: string;
  updated_at: string;
  total_estimated_time?: number; // in minutes
  actual_time_spent?: number; // in minutes
  status: 'active' | 'completed' | 'paused';
}

export interface EditableActionRecord {
  id: string;
  session_id: string;
  text: string;
  estimated_minutes?: number;
  confidence?: 'low' | 'medium' | 'high';
  is_custom: boolean;
  original_text?: string;
  order_index: number;
  completed_at?: string;
  created_at: string;
}