'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardSidebarProps {
  className?: string
}

interface NavItem {
  id: string
  label: string
  icon: string
  href?: string
  onClick?: () => void
  badge?: string | number
}

export function DashboardSidebar({ className = '' }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState('overview')

  const navigationItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      href: '#overview'
    },
    {
      id: 'stats',
      label: 'Your Stats',
      icon: '📈',
      href: '#stats'
    },
    {
      id: 'sessions',
      label: 'Session History',
      icon: '📝',
      href: '#sessions'
    },
    {
      id: 'records',
      label: 'Personal Records',
      icon: '🏆',
      href: '#records'
    },
    {
      id: 'insights',
      label: 'Progress Insights',
      icon: '💡',
      href: '#insights'
    },
    {
      id: 'actions',
      label: 'Action Sessions',
      icon: '⚡',
      href: '#actions'
    }
  ]

  const quickActions: NavItem[] = [
    {
      id: 'new-session',
      label: 'Start Focus Session',
      icon: '▶️',
      href: '/timer'
    },
    {
      id: 'new-action',
      label: 'Start Action Session',
      icon: '🎯',
      href: '/timer?type=action'
    }
  ]

  const handleNavClick = (item: NavItem) => {
    if (item.href?.startsWith('#')) {
      setActiveSection(item.id)
      const element = document.getElementById(item.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <aside className={`w-64 flex-shrink-0 ${className}`}>
      <div className="sticky top-20 space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Quick Actions
          </h3>
          <div className="space-y-2">
            {quickActions.map((item) => (
              <Link
                key={item.id}
                href={item.href!}
                className="flex items-center space-x-3 p-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Dashboard Sections
          </h3>
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors duration-200 text-left ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
            Settings
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setActiveSection('settings')}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-sm font-medium transition-colors duration-200 text-left ${
                activeSection === 'settings'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">⚙️</span>
              <span>User Settings</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}