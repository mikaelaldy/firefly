import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

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

function generateInsights(stats: Partial<DashboardStatsResponse>): Array<{
  message: string;
  type: 'celebration' | 'encouragement' | 'tip';
}> {
  const insights: Array<{
    message: string;
    type: 'celebration' | 'encouragement' | 'tip';
  }> = [];

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

    // Get all sessions for the user
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

    const allSessions = sessions || [];
    
    console.log('Dashboard API - Sessions query result:', {
      sessionsCount: allSessions.length,
      sessions: allSessions.map(s => ({
        id: s.id,
        goal: s.goal,
        actual_duration: s.actual_duration,
        user_id: s.user_id,
        started_at: s.started_at
      }))
    });
    
    // Calculate stats
    const now = new Date();
    const weekStart = getWeekStart(now);
    
    // Sessions this week
    const sessionsThisWeek = allSessions.filter(session => 
      new Date(session.started_at) >= weekStart
    ).length;

    // Total focus time (ALL sessions - partial sessions count too!)
    const totalFocusTime = allSessions.reduce((total, session) => 
      total + (session.actual_duration || 0), 0
    ) / 60; // Convert to minutes

    // Completed sessions for completion rate calculation
    const completedSessions = allSessions.filter(session => session.completed);

    // Average session length (based on all sessions with actual duration)
    const sessionsWithDuration = allSessions.filter(session => session.actual_duration && session.actual_duration > 0);
    const averageSessionLength = sessionsWithDuration.length > 0 
      ? totalFocusTime / sessionsWithDuration.length 
      : 0;

    // Completion rate
    const completionRate = allSessions.length > 0 
      ? Math.round((completedSessions.length / allSessions.length) * 100)
      : 0;

    // Personal records
    const longestSession = sessionsWithDuration.length > 0
      ? Math.max(...sessionsWithDuration.map(s => s.actual_duration || 0)) / 60
      : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Group sessions by date (any session counts for streaks - showing up matters!)
    const sessionsByDate = new Map<string, boolean>();
    allSessions.forEach(session => {
      const date = new Date(session.started_at).toDateString();
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
    sessionsWithDuration.forEach(session => {
      const sessionDate = new Date(session.started_at);
      const weekStartDate = getWeekStart(sessionDate);
      const weekKey = weekStartDate.toISOString().split('T')[0];
      
      const currentTotal = weeklyTotals.get(weekKey) || 0;
      weeklyTotals.set(weekKey, currentTotal + (session.actual_duration || 0));
    });

    const bestWeek = weeklyTotals.size > 0 
      ? Math.max(...Array.from(weeklyTotals.values())) / 60
      : 0;

    // Recent sessions (last 10)
    const recentSessions = allSessions.slice(0, 10).map(session => ({
      id: session.id,
      goal: session.goal,
      plannedDuration: session.planned_duration,
      actualDuration: session.actual_duration || 0,
      completed: session.completed,
      variance: session.variance || calculateVariance(session.planned_duration, session.actual_duration || 0),
      startedAt: session.started_at,
      completedAt: session.completed_at
    }));

    const stats: DashboardStatsResponse = {
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
      })
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