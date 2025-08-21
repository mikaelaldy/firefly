'use client'

import { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
  className?: string
}

export function Sidebar({ children, className = '' }: SidebarProps) {
  return (
    <aside className={`w-full lg:w-80 flex-shrink-0 ${className}`}>
      <div className="sticky top-20 space-y-6">
        {children}
      </div>
    </aside>
  )
}

interface SidebarSectionProps {
  title: string
  children: ReactNode
  className?: string
}

export function SidebarSection({ title, children, className = '' }: SidebarSectionProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      {children}
    </div>
  )
}
