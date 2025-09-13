'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const QuickOptionCard = ({ title, description, tag, icon, onClick }: { title: string, description: string, tag: string, icon: string, onClick: () => void }) => (
  <button onClick={onClick} className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 flex items-start space-x-4">
    <div className="text-2xl">{icon}</div>
    <div>
      <h4 className="font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
      <div className={`mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${tag === 'Custom' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{tag}</div>
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
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Ready to Focus?
      </h3>
      <p className="text-gray-600 mb-6">
        Choose how you want to start your next session
      </p>
      
      <Button 
        onClick={handleStartNewSession} 
        disabled={isStarting}
        className="w-full mb-6" 
        size="lg"
      >
        {isStarting ? 'Starting...' : 'Start New Session'}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickOptionCard 
          icon="⚡"
          title="Quick Focus"
          description="Just start like a 25..."
          tag="25 min"
          onClick={() => router.push('/timer?duration=25&goal=Quick focus session')}
        />
        <QuickOptionCard 
          icon="🎯"
          title="Deep Work"
          description="Long session for co..."
          tag="90 min"
          onClick={() => router.push('/timer?duration=90&goal=Deep work session')}
        />
        <QuickOptionCard 
          icon="CUSTOM_ICON" // Replace with actual icon
          title="Custom Goal"
          description="Set your own goal an..."
          tag="Custom"
          onClick={handleStartNewSession}
        />
        <ProTipCard />
      </div>
    </div>
  )
}
