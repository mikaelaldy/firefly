import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic rendering since we need to access request headers
export const dynamic = 'force-dynamic';

// Dashboard stats interface
interface DashboardStatsResponse {
  totalFocusTime: number; // in minutes
  averageSessionLength: number; // in minutes
  completionRate: number; // percentage
  sessionsThisWeek: number;
  personalRecords: {
    longestSession: number; // in minutes
    bestWeek: number; // total minutes
    currentStreak: number; // days
    longestStreak: number; // days
  };
  recentSessions: Array<{
    id: string;
    goal: string;
    plannedDuration: number; // seconds
    actualDuration: number; // seconds
    completed: boolean;
    variance: number; // percentage
    startedAt: string;
    completedAt?: string;
  }>;
  insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }>;
}

function calculateVariance(planned: number, actual: number): number {
  if (planned === 0) return 0;
  return Math.round(((actual - planned) / planned) * 100);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function generateInsights(
  stats: Partial<DashboardStatsResponse>, 
  actionSessions: any[]
): Array<{
  message: string;
  type: 'celebration' | 'encouragement' | 'tip';
}> {
  const insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }> = [];

  // Calculate time estimation accuracy for action sessions
  const actionSessionsWithEstimates = actionSessions.filter(session => 
    session.total_estimated_time && session.actual_time_spent
  );
  
  let estimationAccuracy = 0;
  if (actionSessionsWithEstimates.length > 0) {
    const accuracySum = actionSessionsWithEstimates.reduce((sum, session) => {
      const variance = Math.abs(calculateVariance(
        session.total_estimated_time * 60, 
        session.actual_time_spent * 60
      ));
      return sum + Math.max(0, 100 - variance); // Convert variance to accuracy percentage
    }, 0);
    estimationAccuracy = accuracySum / actionSessionsWithEstimates.length;
  }

  // Celebration insights
  if (stats.personalRecords?.currentStreak && stats.personalRecords.currentStreak >= 3) {
    insights.push({
      message: `Amazing! You're on a ${stats.personalRecords.currentStreak}-day focus streak! 🔥`,
      type: 'celebration'
    });
  }

  if (stats.totalFocusTime && stats.totalFocusTime >= 120) { // 2+ hours
    insights.push({
      message: `You've focused for ${Math.round(stats.totalFocusTime / 60 * 10) / 10} hours total - that's incredible progress! 🎯`,
      type: 'celebration'
    });
  }

  if (stats.completionRate && stats.completionRate >= 80) {
    insights.push({
      message: `${stats.completionRate}% completion rate - you're crushing your goals! 💪`,
      type: 'celebration'
    });
  }

  // Time estimation insights for action sessions
  if (estimationAccuracy >= 80 && actionSessionsWithEstimates.length >= 3) {
    insights.push({
      message: `Your time estimates are ${Math.round(estimationAccuracy)}% accurate - you're getting great at planning! 📊`,
      type: 'celebration'
    });
  }

  // Encouragement insights
  if (stats.sessionsThisWeek === 0) {
    insights.push({
      message: "Ready to start fresh? Even 5 minutes of focused work can build momentum! 🌱",
      type: 'encouragement'
    });
  } else if (stats.sessionsThisWeek && stats.sessionsThisWeek < 3) {
    insights.push({
      message: "You're building a great habit! Each session makes the next one easier. 🚀",
      type: 'encouragement'
    });
  }

  // Tips
  if (stats.averageSessionLength && stats.averageSessionLength < 15) {
    insights.push({
      message: "Short sessions are perfect for ADHD brains! Consider the Pomodoro technique (25min work, 5min break). ⏰",
      type: 'tip'
    });
  }

  if (stats.completionRate && stats.completionRate < 50) {
    insights.push({
      message: "Struggling to finish sessions? Try starting with 10-15 minute timers to build confidence! 💡",
      type: 'tip'
    });
  }

  // Time estimation tips
  if (estimationAccuracy < 60 && actionSessionsWithEstimates.length >= 2) {
    insights.push({
      message: "Time estimates getting tricky? ADHD brains often underestimate - try adding 25% buffer time! ⏱️",
      type: 'tip'
    });
  }

  if (actionSessions.length > 0) {
    const completedActions = actionSessions.reduce((total, session) => {
      return total + (session.editable_actions?.filter((action: any) => action.completed_at).length || 0);
    }, 0);
    
    const totalActions = actionSessions.reduce((total, session) => {
      return total + (session.editable_actions?.length || 0);
    }, 0);
    
    if (completedActions > 0 && totalActions > 0) {
      const actionCompletionRate = Math.round((completedActions / totalActions) * 100);
      if (actionCompletionRate >= 75) {
        insights.push({
          message: `${actionCompletionRate}% of your planned actions completed - you're making real progress! ✅`,
          type: 'celebration'
        });
      }
    }
  }

  // Default encouragement if no insights generated
  if (insights.length === 0) {
    insights.push({
      message: "Every focus session is a win! You're building stronger attention muscles. 🧠✨",
      type: 'encouragement'
    });
  }

  return insights.slice(0, 3); // Limit to 3 insights
}

export async function GET(request: NextRequest) {
  try {
    // Try to get auth token from header first
    const authHeader = request.headers.get('authorization')
    let supabase = createServerClient()
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      // Create a new client with the token
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: authHeader
            }
          }
        }
      )
    }
    
    // Get current user with better error handling
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Dashboard API - Auth check:', { user: user?.id, authError, hasAuthHeader: !!authHeader });
    
    if (authError) {
      console.error('Dashboard API - Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error: ' + authError.message },
        { status: 401 }
      );
    }
    
    if (!user) {
      console.log('Dashboard API - No user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get all sessions for the user (both regular sessions and action sessions)
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch session data' },
        { status: 500 }
      );
    }

    // Get action sessions for the user
    const { data: actionSessions, error: actionSessionsError } = await supabase
      .from('action_sessions')
      .select(`
        *,
        editable_actions (
          id,
          text,
          estimated_minutes,
          confidence,
          is_custom,
          order_index,
          completed_at,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (actionSessionsError) {
      console.error('Error fetching action sessions:', actionSessionsError);
      // Don't fail completely, just log the error and continue with regular sessions
    }

    const allSessions = sessions || [];
    const allActionSessions = actionSessions || [];
    
    console.log('Dashboard API - Sessions query result:', {
      sessionsCount: allSessions.length,
      actionSessionsCount: allActionSessions.length,
      sessions: allSessions.map(s => ({
        id: s.id,
        goal: s.goal,
        actual_duration: s.actual_duration,
        user_id: s.user_id,
        started_at: s.started_at
      }))
    });
    
    // Calculate stats including both session types
    const now = new Date();
    const weekStart = getWeekStart(now);
    
    // Sessions this week (both types)
    const regularSessionsThisWeek = allSessions.filter(session => 
      new Date(session.started_at) >= weekStart
    ).length;
    
    const actionSessionsThisWeek = allActionSessions.filter(session => 
      new Date(session.created_at) >= weekStart
    ).length;
    
    const sessionsThisWeek = regularSessionsThisWeek + actionSessionsThisWeek;

    // Total focus time (ALL sessions - partial sessions count too!)
    const regularFocusTime = allSessions.reduce((total, session) => 
      total + (session.actual_duration || 0), 0
    ) / 60; // Convert to minutes
    
    const actionFocusTime = allActionSessions.reduce((total, session) => 
      total + (session.actual_time_spent || 0), 0
    ); // Already in minutes
    
    const totalFocusTime = regularFocusTime + actionFocusTime;

    // Completed sessions for completion rate calculation
    const completedSessions = allSessions.filter(session => session.completed);
    const completedActionSessions = allActionSessions.filter(session => session.status === 'completed');

    // Average session length (based on all sessions with actual duration)
    const sessionsWithDuration = allSessions.filter(session => session.actual_duration && session.actual_duration > 0);
    const actionSessionsWithDuration = allActionSessions.filter(session => session.actual_time_spent && session.actual_time_spent > 0);
    
    const totalSessionsWithDuration = sessionsWithDuration.length + actionSessionsWithDuration.length;
    const averageSessionLength = totalSessionsWithDuration > 0 
      ? totalFocusTime / totalSessionsWithDuration 
      : 0;

    // Completion rate
    const totalSessions = allSessions.length + allActionSessions.length;
    const totalCompletedSessions = completedSessions.length + completedActionSessions.length;
    const completionRate = totalSessions > 0 
      ? Math.round((totalCompletedSessions / totalSessions) * 100)
      : 0;

    // Personal records (include both session types)
    const regularLongestSession = sessionsWithDuration.length > 0
      ? Math.max(...sessionsWithDuration.map(s => s.actual_duration || 0)) / 60
      : 0;
    
    const actionLongestSession = actionSessionsWithDuration.length > 0
      ? Math.max(...actionSessionsWithDuration.map(s => s.actual_time_spent || 0))
      : 0;
    
    const longestSession = Math.max(regularLongestSession, actionLongestSession);

    // Calculate streaks (include both session types)
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Group sessions by date (any session counts for streaks - showing up matters!)
    const sessionsByDate = new Map<string, boolean>();
    allSessions.forEach(session => {
      const date = new Date(session.started_at).toDateString();
      sessionsByDate.set(date, true);
    });
    
    allActionSessions.forEach(session => {
      const date = new Date(session.created_at).toDateString();
      sessionsByDate.set(date, true);
    });

    // Calculate current streak (consecutive days from today backwards)
    let checkDate = new Date();
    while (sessionsByDate.has(checkDate.toDateString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    const sortedDates = Array.from(sessionsByDate.keys()).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      tempStreak = 1;
      let currentDate = new Date(sortedDates[i]);
      
      for (let j = i + 1; j < sortedDates.length; j++) {
        const nextDate = new Date(sortedDates[j]);
        const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (dayDiff === 1) {
          tempStreak++;
          currentDate = nextDate;
        } else {
          break;
        }
      }
      
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Best week calculation (include all sessions with duration)
    const weeklyTotals = new Map<string, number>();
    
    // Add regular sessions
    sessionsWithDuration.forEach(session => {
      const sessionDate = new Date(session.started_at);
      const weekStartDate = getWeekStart(sessionDate);
      const weekKey = weekStartDate.toISOString().split('T')[0];
      
      const currentTotal = weeklyTotals.get(weekKey) || 0;
      weeklyTotals.set(weekKey, currentTotal + (session.actual_duration || 0) / 60); // Convert to minutes
    });
    
    // Add action sessions
    actionSessionsWithDuration.forEach(session => {
      const sessionDate = new Date(session.created_at);
      const weekStartDate = getWeekStart(sessionDate);
      const weekKey = weekStartDate.toISOString().split('T')[0];
      
      const currentTotal = weeklyTotals.get(weekKey) || 0;
      weeklyTotals.set(weekKey, currentTotal + (session.actual_time_spent || 0)); // Already in minutes
    });

    const bestWeek = weeklyTotals.size > 0 
      ? Math.max(...Array.from(weeklyTotals.values()))
      : 0;

    // Recent sessions (last 10, combining both types)
    const combinedSessions = [
      ...allSessions.map(session => ({
        id: session.id,
        goal: session.goal,
        plannedDuration: session.planned_duration,
        actualDuration: session.actual_duration || 0,
        completed: session.completed,
        variance: session.variance || calculateVariance(session.planned_duration, session.actual_duration || 0),
        startedAt: session.started_at,
        completedAt: session.completed_at,
        type: 'regular' as const
      })),
      ...allActionSessions.map(session => ({
        id: session.id,
        goal: session.goal,
        plannedDuration: (session.total_estimated_time || 0) * 60, // Convert to seconds
        actualDuration: (session.actual_time_spent || 0) * 60, // Convert to seconds
        completed: session.status === 'completed',
        variance: calculateVariance(
          (session.total_estimated_time || 0) * 60, 
          (session.actual_time_spent || 0) * 60
        ),
        startedAt: session.created_at,
        completedAt: session.status === 'completed' ? session.updated_at : undefined,
        type: 'action' as const,
        actions: session.editable_actions || []
      }))
    ];

    // Sort by start date and take the 10 most recent
    const recentSessions = combinedSessions
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, 10);

    const stats: DashboardStatsResponse & { actionSessions: typeof allActionSessions } = {
      totalFocusTime: Math.round(totalFocusTime),
      averageSessionLength: Math.round(averageSessionLength),
      completionRate,
      sessionsThisWeek,
      personalRecords: {
        longestSession: Math.round(longestSession),
        bestWeek: Math.round(bestWeek),
        currentStreak,
        longestStreak
      },
      recentSessions,
      insights: generateInsights({
        totalFocusTime: Math.round(totalFocusTime),
        averageSessionLength: Math.round(averageSessionLength),
        completionRate,
        sessionsThisWeek,
        personalRecords: {
          longestSession: Math.round(longestSession),
          bestWeek: Math.round(bestWeek),
          currentStreak,
          longestStreak
        }
      }, allActionSessions),
      actionSessions: allActionSessions
    };

    console.log('Dashboard API - Returning stats:', {
      totalFocusTime: stats.totalFocusTime,
      recentSessionsCount: stats.recentSessions.length,
      allSessionsCount: allSessions.length,
      firstSession: allSessions[0] || 'none'
    });

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}