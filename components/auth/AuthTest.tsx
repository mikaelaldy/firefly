'use client'

import { useState } from 'react'
import { useAuthenticatedOperations } from '@/lib/auth/hooks'

export function AuthTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const { isAuthenticated, saveTask, getRecentTasks } = useAuthenticatedOperations()

  const testSaveTask = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      const result = await saveTask('Test task for auth verification', undefined, 'low')
      
      if (result) {
        setTestResult(`✅ Task saved successfully! ID: ${result.id}`)
      } else {
        setTestResult('⚡ Not authenticated - task would be handled locally')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testGetTasks = async () => {
    setLoading(true)
    setTestResult('')
    
    try {
      const tasks = await getRecentTasks(5)
      
      if (tasks) {
        setTestResult(`✅ Retrieved ${tasks.length} tasks from database`)
      } else {
        setTestResult('⚡ Not authenticated - would show local tasks only')
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Test</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Status: {isAuthenticated ? '🟢 Authenticated' : '🔴 Not Authenticated'}
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={testSaveTask}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-md transition-colors"
        >
          {loading ? 'Testing...' : 'Test Save Task'}
        </button>

        <button
          onClick={testGetTasks}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-400 rounded-md transition-colors"
        >
          {loading ? 'Testing...' : 'Test Get Tasks'}
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-3 bg-white rounded border text-sm">
          {testResult}
        </div>
      )}
    </div>
  )
}