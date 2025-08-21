'use client'

import { useEffect, useState } from 'react'

interface DashboardStatsProps {
  stats: {
    totalFocusTime: number;
    averageSessionLength: number;
    completionRate: number;
    sessionsThisWeek: number;
  } | null;
  loading: boolean;
}

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
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

  const statCards = [
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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