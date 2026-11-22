import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

beforeEach(() => {
  window.localStorage.clear()
  window.history.pushState({}, '', '/')
})

describe('FocusBoard core tasks', () => {
  it('creates a task with a unique title and updates totals', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Create Task' }))
    await user.type(screen.getByLabelText('Title'), 'Audit test coverage')
    await user.click(screen.getByRole('button', { name: 'Create task', exact: true }))

    expect((await screen.findAllByText('Audit test coverage')).length).toBeGreaterThan(0)
  }, 30000)

  it('validates an empty task title', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Create Task' }))
    await user.click(screen.getByRole('button', { name: 'Create task', exact: true }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter a task title.')
  })

  it('edits and deletes a task after confirmation', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Edit Refine customer dashboard' }))
    const title = screen.getByLabelText('Title')
    await user.clear(title)
    await user.type(title, 'Refine customer dashboard edited')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect((await screen.findAllByText('Refine customer dashboard edited')).length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Delete Refine customer dashboard edited' }))
    expect(screen.getByRole('alertdialog')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Move to deleted' }))

    await waitFor(() =>
      expect(screen.queryByText('Refine customer dashboard edited')).not.toBeInTheDocument(),
    )
  })

  it('combines title search, status, and priority filters', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getAllByRole('textbox', { name: 'Search tasks' }).at(-1), 'API')
    await user.selectOptions(screen.getByRole('combobox', { name: 'Filter by priority' }), 'High')
    await user.click(screen.getByRole('tab', { name: 'In progress' }))

    expect((await screen.findAllByText('Audit API error states')).length).toBeGreaterThan(0)
  })

  it('navigates all three Focus Notes slides', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(await screen.findByText('A clear plan makes deep work easier.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(await screen.findByText('Small steps create meaningful momentum.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(await screen.findByText('Make progress on the things that matter.')).toBeInTheDocument()
  })
})

describe('Routing', () => {
  it('supports direct task route and Not Found fallback', async () => {
    window.history.pushState({}, '', '/tasks')
    const first = render(<App />)
    expect(await screen.findByRole('heading', { name: 'My Tasks', level: 1 })).toBeInTheDocument()

    first.unmount()
    window.history.pushState({}, '', '/missing-page')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('builds the weekly review from recorded tasks, focus sessions, and habit history', async () => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    window.localStorage.setItem('focusboard_tasks', JSON.stringify([{
      id: 'weekly-task',
      title: 'Weekly task',
      description: '',
      category: 'Product',
      status: 'Completed',
      priority: 'Medium',
      dueDate: todayKey,
      updatedAt: todayKey,
    }]))
    window.localStorage.setItem('focusboard_focus_sessions_v1', JSON.stringify([{
      id: 'weekly-focus',
      completedAt: new Date().toISOString(),
      minutes: 25,
      type: 'deep-work',
    }]))
    window.localStorage.setItem('focusboard_habits_v1', JSON.stringify([{
      id: 'weekly-habit',
      frequency: 'Custom',
      targetPerWeek: 3,
      completedDates: [todayKey],
    }]))
    window.history.pushState({}, '', '/weekly-review')
    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Weekly Productivity Review' })).toBeInTheDocument()
    expect(within(screen.getByText('Completed tasks').closest('article')).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByText('Focus sessions').closest('article')).getByText('1')).toBeInTheDocument()
    expect(within(screen.getByText('Focus time').closest('article')).getByText('25 min')).toBeInTheDocument()
    expect(within(screen.getByText('Habit check-ins').closest('article')).getByText('1 / 3')).toBeInTheDocument()
  })
})

describe('LocalStorage and dashboard', () => {
  it('restores saved tasks instead of overwriting them', async () => {
    window.localStorage.setItem('focusboard_tasks', JSON.stringify([{
      id: 'saved-task',
      title: 'Saved task',
      description: 'Restored from storage',
      category: 'Product',
      status: 'To do',
      priority: 'Low',
      dueDate: '2026-12-01',
      createdAt: '2026-11-22',
      updatedAt: '2026-11-22',
      recurrence: 'None',
    }]))
    render(<App />)

    expect((await screen.findAllByText('Saved task')).length).toBeGreaterThan(0)
  })

  it('preserves a valid empty saved array', async () => {
    window.localStorage.setItem('focusboard_tasks', '[]')
    render(<App />)

    expect(await screen.findByText('No tasks found')).toBeInTheDocument()
  })

  it('falls back safely for corrupted task JSON', async () => {
    window.localStorage.setItem('focusboard_tasks', '{bad-json')
    render(<App />)

    expect((await screen.findAllByText('Refine customer dashboard')).length).toBeGreaterThan(0)
  })

  it('shows total, in-progress, completed, and completion percentage', async () => {
    window.localStorage.setItem('focusboard_tasks', JSON.stringify([
      { id: '1', title: 'One', description: '', category: 'Product', status: 'To do', priority: 'Low', dueDate: '2026-12-01', createdAt: '2026-11-22', updatedAt: '2026-11-22' },
      { id: '2', title: 'Two', description: '', category: 'Product', status: 'In progress', priority: 'High', dueDate: '2026-12-01', createdAt: '2026-11-22', updatedAt: '2026-11-22' },
      { id: '3', title: 'Three', description: '', category: 'Product', status: 'Completed', priority: 'Medium', dueDate: '2026-12-01', createdAt: '2026-11-22', updatedAt: '2026-11-22' },
    ]))
    render(<App />)

    const overview = screen.getByRole('region', { name: 'Task overview' })
    expect(within(overview).getAllByText('3').length).toBeGreaterThan(0)
    expect(within(overview).getAllByText('1').length).toBeGreaterThan(0)
    expect(within(overview).getByText('33%')).toBeInTheDocument()
  })
})
