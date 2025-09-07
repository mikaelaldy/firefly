'use client'

import { useEffect, useState } from 'react'

interface DashboardStatsProps {
  stats: {
    totalFocusTime: number;
    averageSessionLength: number;
    completionRate: number;
    sessionsThisWeek: number;
  } | null;
  actionSessions?: Array<{
    id: string;
    goal: string;
    total_estimated_time?: number;
    actual_time_spent?: number;
    status: string;
    created_at: string;
    editable_actions?: Array<{
      id: string;
      text: string;
      estimated_minutes?: number;
      confidence?: 'low' | 'medium' | 'high';
      is_custom?: boolean;
      completed_at?: string;
    }>;
  }>;
  loading: boolean;
}

export function DashboardStats({ stats, actionSessions = [], loading }: DashboardStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Unable to load dashboard stats</p>
      </div>
    );
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Calculate action session stats
  const totalActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.length || 0), 0
  );
  
  const completedActions = actionSessions.reduce((total, session) => 
    total + (session.editable_actions?.filter(action => action.completed_at).length || 0), 0
  );

  const actionSessionsWithEstimates = actionSessions.filter(session => 
    session.total_estimated_time && session.actual_time_spent
  );

  let averageAccuracy = 0;
  if (actionSessionsWithEstimates.length > 0) {
    const accuracySum = actionSessionsWithEstimates.reduce((sum, session) => {
      const estimatedMinutes = session.total_estimated_time || 0;
      const actualMinutes = session.actual_time_spent || 0;
      if (estimatedMinutes === 0) return sum;
      
      const variance = Math.abs((actualMinutes - estimatedMinutes) / estimatedMinutes);
      const accuracy = Math.max(0, 1 - variance);
      return sum + accuracy;
    }, 0);
    averageAccuracy = (accuracySum / actionSessionsWithEstimates.length) * 100;
  }

  const baseStatCards = [
    {
      title: 'Total Focus Time',
      value: formatTime(stats.totalFocusTime),
      icon: '⏱️',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Average Session',
      value: formatTime(stats.averageSessionLength),
      icon: '📊',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: '🎯',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'This Week',
      value: `${stats.sessionsThisWeek} sessions`,
      icon: '📅',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  // Add action-specific stats if there are action sessions
  const actionStatCards = actionSessions.length > 0 ? [
    {
      title: 'Actions Completed',
      value: `${completedActions}/${totalActions}`,
      icon: '✅',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    ...(averageAccuracy > 0 ? [{
      title: 'Time Accuracy',
      value: `${Math.round(averageAccuracy)}%`,
      icon: '🎯',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600'
    }] : [])
  ] : [];

  const statCards = [...baseStatCards, ...actionStatCards];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${
      statCards.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-6'
    } gap-6`}>
      {statCards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-xl shadow-sm border border-gray-100 p-6 transition-transform duration-200 hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl">{card.icon}</div>
            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${card.color}`}></div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{card.title}</p>
            <p className={`text-2xl font-bold ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}