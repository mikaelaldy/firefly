'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardSidebarProps {
  className?: string
}

interface NavItem {
  label: string
  icon: string
  href: string
}

const QuickStats = () => (
    <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
        <h3 className="font-semibold text-gray-800 mb-3">Quick Stats</h3>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-gray-600">Today</span>
                <span className="font-medium text-gray-900">2h 15m</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">Streak</span>
                <span className="font-medium text-gray-900">7 days</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-600">Goal</span>
                <span className="font-medium text-gray-900">85%</span>
            </div>
        </div>
    </div>
)

export function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navigationItems: NavItem[] = [
    { label: 'Dashboard', icon: '🏠', href: '/dashboard' },
    { label: 'Focus Timer', icon: '⏱️', href: '/timer' },
    { label: 'Goals', icon: '🎯', href: '/goals' },
    { label: 'Analytics', icon: '📊', href: '/analytics' },
    { label: 'Tasks', icon: '✅', href: '/tasks' },
    { label: 'Settings', icon: '⚙️', href: '/settings' },
    { label: 'Help', icon: '❓', href: '/help' },
  ]

  return (
    <aside className={`w-64 flex-shrink-0 ${className}`}>
      <div className="sticky top-24 space-y-6">
        <div className="p-4 rounded-lg bg-white border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Firefly</h2>
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                pathname === item.href
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <QuickStats />
      </div>
    </aside>
  )
}