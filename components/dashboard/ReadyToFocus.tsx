'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const QuickOptionCard = ({ title, description, tag, icon, onClick }: { title: string, description: string, tag: string, icon: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    role="button"
    aria-label={`${title} option`}
    className="w-full text-left p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 flex items-start space-x-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
  >
    <div className="text-3xl" aria-hidden="true">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900 text-base">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
      <div
        className={`mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${tag === 'Custom' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
      >
        {tag}
      </div>
    </div>
  </button>
);

const ProTipCard = () => (
    <div className="w-full text-left p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start space-x-4">
        <div className="text-2xl">💡</div>
        <div>
            <h4 className="font-semibold text-gray-900">Pro tip</h4>
            <p className="text-sm text-gray-600">Starting is the hardest part. Once you begin, your ADHD hyperfocus can be your superpower!</p>
        </div>
    </div>
);

export function ReadyToFocus() {
  const [isStarting, setIsStarting] = useState(false)
  const router = useRouter()

  const handleStartNewSession = () => {
    setIsStarting(true)
    router.push('/')
  }

  return (
    <section aria-labelledby="ready-to-focus-heading">
      <h2 id="ready-to-focus-heading" className="text-2xl font-bold text-gray-900 mb-2 text-center">
        Ready to Focus?
      </h2>
      <p className="text-gray-600 mb-5 text-center">Choose how you want to start your next session</p>

      <div className="flex justify-center">
        <Button
          onClick={handleStartNewSession}
          disabled={isStarting}
          aria-label="Start a new focus session"
          className="mb-6 w-full sm:w-auto px-8 py-6 text-base"
          size="lg"
        >
          {isStarting ? 'Starting...' : 'Start New Session'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Quick start options">
        <QuickOptionCard
          icon="⚡"
          title="Quick Focus"
          description="Jump into a 25‑minute sprint"
          tag="25 min"
          onClick={() => router.push('/timer?duration=25&goal=Quick focus session')}
        />
        <QuickOptionCard
          icon="🎯"
          title="Deep Work"
          description="Long, distraction‑free block"
          tag="90 min"
          onClick={() => router.push('/timer?duration=90&goal=Deep work session')}
        />
        <QuickOptionCard
          icon="🛠️"
          title="Custom Goal"
          description="Set your own goal and duration"
          tag="Custom"
          onClick={handleStartNewSession}
        />
      </div>

      <div className="mt-4">
        <ProTipCard />
      </div>
    </section>
  )
}
