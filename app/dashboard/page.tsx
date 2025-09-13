"use client"

import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { ReadyToFocus } from '@/components/dashboard/ReadyToFocus'

export default function DashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-64 border-r border-gray-200 hidden md:block">
        <DashboardSidebar />
      </aside>
      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <ReadyToFocus />
        </div>
      </main>
    </div>
  )
}