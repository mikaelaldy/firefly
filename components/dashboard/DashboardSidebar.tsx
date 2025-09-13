'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/context'

interface DashboardSidebarProps {
  className?: string
  collapsed?: boolean
}

interface NavItem {
  label: string
  icon: string
  href: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const QuickStats = ({ collapsed }: { collapsed?: boolean }) => {
  if (collapsed) {
    return (
      <div className="px-2 py-3 border-t border-gray-200 bg-gray-50">
        <div className="space-y-2">
          <div className="text-center">
            <div className="text-sm font-bold text-blue-600">2h</div>
            <div className="text-xs text-gray-500">Today</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-green-600">7</div>
            <div className="text-xs text-gray-500">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-purple-600">85%</div>
            <div className="text-xs text-gray-500">Goal</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <h3 className="font-semibold text-gray-800 mb-3 text-sm">Quick Stats</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Today</span>
          <span className="font-medium text-blue-600">2h 15m</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Streak</span>
          <span className="font-medium text-green-600">7 days</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Goal</span>
          <span className="font-medium text-purple-600">85%</span>
        </div>
      </div>
    </div>
  )
}

export function DashboardSidebar({ className = '', collapsed = false }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [expandedSections, setExpandedSections] = useState<string[]>(['focus', 'tools'])

  const navigationSections: NavSection[] = [
    {
      title: 'Focus',
      items: [
        { label: 'Dashboard', icon: '🏠', href: '/dashboard' },
        { label: 'Focus Timer', icon: '⏱️', href: '/timer' },
        { label: 'Goals', icon: '🎯', href: '/goals' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { label: 'Analytics', icon: '📊', href: '/analytics' },
        { label: 'Tasks', icon: '✅', href: '/tasks' },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Settings', icon: '⚙️', href: '/settings' },
        { label: 'Help', icon: '❓', href: '/help' },
      ]
    }
  ]

  const toggleSection = (sectionTitle: string) => {
    if (collapsed) return
    
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    )
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Logo/Brand */}
      <div className="px-4 py-3">
        {collapsed ? (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">F</span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Firefly</h2>
          </div>
        )}
      </div>

      {/* User Profile */}
      {user && (
        <div className="px-4 pb-3 mb-2 border-b border-gray-200">
          {collapsed ? (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto">
              <span className="text-gray-600 font-medium text-sm">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        {navigationSections.map((section) => {
          const isExpanded = expandedSections.includes(section.title.toLowerCase())
          
          return (
            <div key={section.title} className="mb-4">
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.title.toLowerCase())}
                  className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
                >
                  <span>{section.title}</span>
                  <svg 
                    className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {(collapsed || isExpanded) && (
                <div className="space-y-1 mt-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={`text-lg ${collapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
                      {!collapsed && <span className="ml-3">{item.label}</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Quick Stats Footer */}
      <QuickStats collapsed={collapsed} />
    </div>
  )
}