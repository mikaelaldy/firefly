import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { EditableNextActions } from '../EditableNextActions'

// Mock fetch for AI estimation API
global.fetch = vi.fn()

describe('EditableNextActions Integration', () => {
  const mockActions = [
    'Break your goal into 3 smaller steps',
    'Choose the easiest step to start with',
    'Set up your workspace for focused work'
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with all features: edit, delete, add, and AI estimation', () => {
    render(<EditableNextActions initialActions={mockActions} />)
    
    // Check basic rendering
    expect(screen.getByText('📋 Next Actions')).toBeInTheDocument()
    expect(screen.getByText('Click to edit')).toBeInTheDocument()
    
    // Check actions are rendered
    expect(screen.getByText('Break your goal into 3 smaller steps')).toBeInTheDocument()
    expect(screen.getByText('Choose the easiest step to start with')).toBeInTheDocument()
    expect(screen.getByText('Set up your workspace for focused work')).toBeInTheDocument()
    
    // Check control buttons
    expect(screen.getByText('Add Action')).toBeInTheDocument()
    expect(screen.getByText('Update with AI')).toBeInTheDocument()
  })

  it('shows loading state during AI estimation', async () => {
    // Mock a delayed API response
    const mockFetch = vi.fn(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({
            estimatedActions: mockActions.map(action => ({
              action,
              estimatedMinutes: 15,
              confidence: 'medium'
            })),
            totalEstimatedTime: 45
          })
        }), 100)
      )
    )
    global.fetch = mockFetch

    render(<EditableNextActions initialActions={mockActions} />)
    
    const updateButton = screen.getByText('Update with AI')
    fireEvent.click(updateButton)
    
    // Check loading state
    expect(screen.getByText('Estimating...')).toBeInTheDocument()
    expect(screen.getByText('🤖 AI is analyzing your actions for time estimates...')).toBeInTheDocument()
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.queryByText('Estimating...')).not.toBeInTheDocument()
    }, { timeout: 200 })
  })

  it('displays time estimates after AI estimation', async () => {
    // Mock successful API response
    const mockFetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          estimatedActions: [
            { action: mockActions[0], estimatedMinutes: 20, confidence: 'high' },
            { action: mockActions[1], estimatedMinutes: 15, confidence: 'medium' },
            { action: mockActions[2], estimatedMinutes: 10, confidence: 'low' }
          ],
          totalEstimatedTime: 45
        })
      })
    )
    global.fetch = mockFetch

    render(<EditableNextActions initialActions={mockActions} />)
    
    const updateButton = screen.getByText('Update with AI')
    fireEvent.click(updateButton)
    
    await waitFor(() => {
      expect(screen.getByText('20m')).toBeInTheDocument()
      expect(screen.getByText('15m')).toBeInTheDocument()
      expect(screen.getByText('10m')).toBeInTheDocument()
      expect(screen.getByText('Total: 45m')).toBeInTheDocument()
    })
    
    // Check confidence indicators
    expect(screen.getByText('high')).toBeInTheDocument()
    expect(screen.getByText('medium')).toBeInTheDocument()
    expect(screen.getByText('low')).toBeInTheDocument()
  })

  it('handles AI estimation errors gracefully', async () => {
    // Mock failed API response
    const mockFetch = vi.fn(() => 
      Promise.resolve({
        ok: false,
        status: 500
      })
    )
    global.fetch = mockFetch

    render(<EditableNextActions initialActions={mockActions} />)
    
    const updateButton = screen.getByText('Update with AI')
    fireEvent.click(updateButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to get AI estimates. Please try again.')).toBeInTheDocument()
    })
    
    // Check that error can be dismissed
    const dismissButton = screen.getByText('Dismiss')
    fireEvent.click(dismissButton)
    
    expect(screen.queryByText('Failed to get AI estimates. Please try again.')).not.toBeInTheDocument()
  })

  it('allows adding and deleting actions', async () => {
    render(<EditableNextActions initialActions={mockActions} />)
    
    // Add a new action
    const addButton = screen.getByText('Add Action')
    fireEvent.click(addButton)
    
    // Should enter edit mode for new action
    const input = screen.getByPlaceholderText('Enter action...')
    fireEvent.change(input, { target: { value: 'New custom action' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('New custom action')).toBeInTheDocument()
      expect(screen.getByText('edited')).toBeInTheDocument()
    })
    
    // Test delete functionality (mock window.confirm)
    const originalConfirm = window.confirm
    window.confirm = vi.fn(() => true)
    
    // Hover over an action to show delete button
    const firstAction = screen.getByText('Break your goal into 3 smaller steps')
    fireEvent.mouseEnter(firstAction.closest('li')!)
    
    // Find and click delete button
    const deleteButtons = screen.getAllByTitle('Delete action')
    fireEvent.click(deleteButtons[0])
    
    await waitFor(() => {
      expect(screen.queryByText('Break your goal into 3 smaller steps')).not.toBeInTheDocument()
    })
    
    window.confirm = originalConfirm
  })
})