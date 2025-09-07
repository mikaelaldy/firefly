import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { EditableNextActions } from '../EditableNextActions'

describe('EditableNextActions', () => {
  const mockActions = [
    'Break your goal into 3 smaller steps',
    'Choose the easiest step to start with',
    'Set up your workspace for focused work'
  ]

  it('renders actions as editable text fields', () => {
    render(<EditableNextActions initialActions={mockActions} />)
    
    expect(screen.getByText('📋 Next Actions')).toBeInTheDocument()
    expect(screen.getByText('Break your goal into 3 smaller steps')).toBeInTheDocument()
    expect(screen.getByText('Choose the easiest step to start with')).toBeInTheDocument()
    expect(screen.getByText('Set up your workspace for focused work')).toBeInTheDocument()
  })

  it('enters edit mode when action is clicked', async () => {
    render(<EditableNextActions initialActions={mockActions} />)
    
    const firstAction = screen.getByText('Break your goal into 3 smaller steps')
    fireEvent.click(firstAction)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Break your goal into 3 smaller steps')).toBeInTheDocument()
    })
  })

  it('saves changes when Enter is pressed', async () => {
    const onActionsChange = vi.fn()
    render(<EditableNextActions initialActions={mockActions} onActionsChange={onActionsChange} />)
    
    const firstAction = screen.getByText('Break your goal into 3 smaller steps')
    fireEvent.click(firstAction)
    
    const input = await screen.findByDisplayValue('Break your goal into 3 smaller steps')
    fireEvent.change(input, { target: { value: 'Modified action text' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('Modified action text')).toBeInTheDocument()
      expect(onActionsChange).toHaveBeenCalled()
    })
  })

  it('cancels edit when Escape is pressed', async () => {
    render(<EditableNextActions initialActions={mockActions} />)
    
    const firstAction = screen.getByText('Break your goal into 3 smaller steps')
    fireEvent.click(firstAction)
    
    const input = await screen.findByDisplayValue('Break your goal into 3 smaller steps')
    fireEvent.change(input, { target: { value: 'Modified action text' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    
    await waitFor(() => {
      expect(screen.getByText('Break your goal into 3 smaller steps')).toBeInTheDocument()
      expect(screen.queryByDisplayValue('Modified action text')).not.toBeInTheDocument()
    })
  })

  it('shows edited indicator for modified actions', async () => {
    render(<EditableNextActions initialActions={mockActions} />)
    
    const firstAction = screen.getByText('Break your goal into 3 smaller steps')
    fireEvent.click(firstAction)
    
    const input = await screen.findByDisplayValue('Break your goal into 3 smaller steps')
    fireEvent.change(input, { target: { value: 'Modified action text' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    await waitFor(() => {
      expect(screen.getByText('edited')).toBeInTheDocument()
    })
  })
})