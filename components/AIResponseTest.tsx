'use client'

import { useState } from 'react'
import { AIResponse } from './AIResponse'
import type { SuggestResponse } from '@/types'

export function AIResponseTest() {
  const [testGoal, setTestGoal] = useState('')
  const [showTest, setShowTest] = useState(false)
  const [receivedSuggestions, setReceivedSuggestions] = useState<SuggestResponse | null>(null)

  const handleTest = () => {
    if (testGoal.trim()) {
      setShowTest(true)
      setReceivedSuggestions(null)
    }
  }

  const handleSuggestionsReceived = (suggestions: SuggestResponse) => {
    setReceivedSuggestions(suggestions)
    console.log('Test received suggestions:', suggestions)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">AIResponse Component Test</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="test-goal" className="block text-sm font-medium text-gray-700 mb-2">
            Test Goal:
          </label>
          <input
            id="test-goal"
            type="text"
            value={testGoal}
            onChange={(e) => setTestGoal(e.target.value)}
            placeholder="Enter a test goal..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleTest}
          disabled={!testGoal.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test AIResponse Component
        </button>
        
        {showTest && testGoal && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Component Output:</h3>
            <AIResponse 
              goal={testGoal}
              onSuggestionsReceived={handleSuggestionsReceived}
            />
          </div>
        )}
        
        {receivedSuggestions && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Received Suggestions (Debug):</h3>
            <pre className="text-sm text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(receivedSuggestions, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}