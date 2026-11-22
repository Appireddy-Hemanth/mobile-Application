import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

beforeEach(() => {
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('FocusBoard dashboard', () => {
  it('initializes six sample tasks and derives overview totals', async () => {
    render(<App />)

    expect(await within(document.querySelector('.task-list')).findByText('Design landing page')).toBeInTheDocument()
    expect(screen.getByText('Fix mobile navigation')).toBeInTheDocument()
    expect(screen.getByText('Review onboarding copy')).toBeInTheDocument()
    expect(within(screen.getByRole('region', { name: 'Task overview' })).getByText('6')).toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('focusboard_tasks'))).toHaveLength(6)
    })
  })

  it('creates a task and validates the required title', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getAllByRole('button', { name: 'New task' })[0])
    await user.click(screen.getByRole('button', { name: 'Create task', exact: true }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter a task title.')

    await user.type(screen.getByLabelText('Task title *'), 'Audit test coverage')
    await user.click(screen.getByRole('button', { name: 'Create task', exact: true }))
    expect(await screen.findByText('Audit test coverage')).toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('focusboard_tasks'))).toEqual(
        expect.arrayContaining([expect.objectContaining({ title: 'Audit test coverage' })]),
      )
    })
  })

  it('edits a task and deletes it only after confirmation', async () => {
    const user = userEvent.setup()
    render(<App />)

    const row = within(document.querySelector('.task-list')).getByText('Design landing page').closest('article')
    const actions = within(row).getByRole('button', { name: 'Actions for Design landing page' })
    await user.click(actions)
    expect(actions).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(actions).toHaveAttribute('aria-expanded', 'false')
    expect(actions).toHaveFocus()
    await user.click(actions)
    await user.click(within(row).getByRole('button', { name: 'Edit task' }))
    const title = screen.getByLabelText('Task title *')
    await user.clear(title)
    await user.type(title, 'Landing page refresh')
    await user.selectOptions(screen.getByLabelText('Category'), 'Development')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))
    expect(await within(document.querySelector('.task-list')).findByText('Landing page refresh')).toBeInTheDocument()

    const editedRow = within(document.querySelector('.task-list')).getByText('Landing page refresh').closest('article')
    expect(within(editedRow).getByText('Development')).toBeInTheDocument()
    await user.click(within(editedRow).getByRole('button', { name: 'Actions for Landing page refresh' }))
    await user.click(within(editedRow).getByRole('button', { name: 'Delete task' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Move to deleted' }))
    await waitFor(() => expect(within(document.querySelector('.task-list')).queryByText('Landing page refresh')).not.toBeInTheDocument())
  })

  it('combines case-insensitive title search, status, and priority filters', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByRole('searchbox', { name: 'Find a task' }), 'POLISH TASK')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by priority' }), 'Medium')
    await user.click(screen.getByRole('tab', { name: /In progress/ }))

    expect(screen.getByText('Polish task cards')).toBeInTheDocument()
    expect(within(document.querySelector('.task-list')).queryByText('Design landing page')).not.toBeInTheDocument()
  })

  it('marks a task completed immediately and updates calculated statistics', async () => {
    const user = userEvent.setup()
    render(<App />)
    const task = screen.getByText('Fix mobile navigation').closest('article')
    await user.click(within(task).getByRole('button', { name: 'Mark Fix mobile navigation as completed' }))
    expect(within(task).getByRole('button', { name: 'Mark Fix mobile navigation as incomplete' })).toHaveClass('is-completed')
    expect(within(task).getByText('Completed')).toBeInTheDocument()
    await waitFor(() => {
      expect(JSON.parse(window.localStorage.getItem('focusboard_tasks'))).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 'fix-mobile-navigation', status: 'Completed' })]),
      )
    })

    const overview = screen.getByRole('region', { name: 'Task overview' })
    expect(within(overview).getByText('3')).toBeInTheDocument()

    await user.click(within(task).getByRole('button', { name: 'Mark Fix mobile navigation as incomplete' }))
    expect(within(task).getByRole('button', { name: 'Mark Fix mobile navigation as completed' })).not.toHaveClass('is-completed')
  })

  it('supports all three focus-note slides and arrow-key navigation', async () => {
    const user = userEvent.setup()
    render(<App />)

    const carousel = screen.getByRole('region', { name: 'Focus Notes carousel' })
    expect(within(carousel).getByRole('heading', { name: 'Make today count.' })).toBeInTheDocument()
    expect(carousel.querySelector('.mobile-progress-copy')).toHaveTextContent('3 tasks waiting for your attention')
    expect(carousel.querySelector('.mobile-progress-copy')).toHaveTextContent('33% complete')
    expect(carousel.querySelector('.progress-track > span')).toHaveStyle({ width: '33%' })
    carousel.focus()
    await user.keyboard('{ArrowRight}')
    expect(within(carousel).getByRole('heading', { name: 'Small steps, big progress.' })).toBeInTheDocument()
    expect(within(carousel).getByText('Fix navigation')).toBeInTheDocument()
    expect(within(carousel).getByText('67%')).toBeInTheDocument()
    await user.click(within(carousel).getByRole('button', { name: 'Next slide' }))
    expect(within(carousel).getByRole('heading', { name: 'Celebrate the wins.' })).toBeInTheDocument()
    expect(within(carousel).getByText('Onboarding copy')).toBeInTheDocument()
  })

  it('moves between status tabs using arrow keys', async () => {
    const user = userEvent.setup()
    render(<App />)
    const allTab = screen.getByRole('tab', { name: /All/ })
    allTab.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: /In progress/ })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{End}')
    expect(screen.getByRole('tab', { name: /Completed/ })).toHaveFocus()
  })

  it('opens the modal with Escape and exposes Calendar and Settings placeholders', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getAllByRole('button', { name: 'New task' })[0])
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'Calendar' })[0])
    expect(await screen.findByRole('heading', { name: 'Calendar' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('button', { name: 'Settings' })[0])
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})

describe('Task persistence', () => {
  it('restores saved tasks and does not replace a saved empty list', async () => {
    window.localStorage.setItem('focusboard_tasks', JSON.stringify([{
      id: 'saved-task',
      title: 'Saved task',
      description: 'Restored from storage',
      category: 'Content',
      status: 'To do',
      priority: 'Low',
      dueDate: '',
    }]))
    const restored = render(<App />)
    expect(await within(document.querySelector('.task-list')).findByText('Saved task')).toBeInTheDocument()
    restored.unmount()

    window.localStorage.setItem('focusboard_tasks', '[]')
    render(<App />)
    expect(await screen.findByText('No tasks found')).toBeInTheDocument()
  })

  it('does not replace corrupt saved data with sample tasks on initial load', async () => {
    window.localStorage.setItem('focusboard_tasks', '{bad-json')
    render(<App />)

    expect(await screen.findByText('No tasks found')).toBeInTheDocument()
    expect(window.localStorage.getItem('focusboard_tasks')).toBe('{bad-json')
  })
})
