'use client'

import React, { ReactNode, useState } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex bg-gray-50" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Sidebar */}
      {sidebar && (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
          <div className="h-full bg-white border-r border-gray-200 shadow-sm" style={{ minHeight: 'calc(100vh - 4rem)' }}>
            {/* Sidebar toggle button */}
            <div className="flex items-center justify-end px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg 
                  className={`w-4 h-4 text-gray-600 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Sidebar content with collapsed prop */}
            <div className="flex-1 overflow-y-auto">
              {React.cloneElement(sidebar as React.ReactElement, { collapsed: sidebarCollapsed })}
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

interface DashboardSectionProps {
  id: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function DashboardSection({ 
  id, 
  title, 
  subtitle, 
  children, 
  className = '' 
}: DashboardSectionProps) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="text-gray-600">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

interface DashboardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function DashboardGrid({ 
  children, 
  columns = 2, 
  className = '' 
}: DashboardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 xl:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  )
}

interface DashboardCardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export function DashboardCard({ 
  children, 
  className = '', 
  padding = 'md' 
}: DashboardCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  // Check if custom padding is provided in className
  const hasCustomPadding = className.includes('p-')
  const defaultPadding = hasCustomPadding ? '' : paddingClasses[padding]

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${defaultPadding} ${className}`}>
      {children}
    </div>
  )
}