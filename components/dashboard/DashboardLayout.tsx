'use client'

import { ReactNode } from 'react'

interface DashboardLayoutProps {
  children: ReactNode
  sidebar?: ReactNode
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {sidebar && (
            <div className="lg:order-1">
              {sidebar}
            </div>
          )}
          
          {/* Main Content */}
          <div className="flex-1 lg:order-2">
            <div className="space-y-8">
              {children}
            </div>
          </div>
        </div>
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

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}