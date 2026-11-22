import { useState } from 'react'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, CheckSquare, LayoutDashboard, Settings } from 'lucide-react'
import { TaskProvider } from './context/TaskContext.jsx'
import { useTaskContext } from './context/useTaskContext'
import Dashboard from './pages/Dashboard'
import TaskModal from './components/TaskModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import './App.css'

const navigation = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/tasks', label: 'My tasks', icon: CheckSquare },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/settings', label: 'Settings', icon: Settings },
]

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>
      <span>FocusBoard</span>
    </span>
  )
}

function AppFrame({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const activePath = location.pathname === '/tasks' ? '/tasks' : location.pathname

  const navButton = ({ path, label, icon: Icon }) => (
    <button
      type="button"
      key={path}
      className={`nav-link ${activePath === path ? 'is-active' : ''}`}
      aria-current={activePath === path ? 'page' : undefined}
      onClick={() => {
        navigate(path)
        if (path === '/tasks') {
          window.setTimeout(() => document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' }), 0)
        } else if (path === '/') {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar">
        <Brand />
        <p className="nav-caption">WORKSPACE</p>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map(navButton)}
        </nav>
        <div className="sidebar-profile">
          <span className="avatar">JD</span>
          <span><strong>Jordan Davis</strong><small>Personal workspace</small></span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <p><span>Workspace</span><b>/</b>{activePath === '/tasks' ? 'My tasks' : activePath === '/calendar' ? 'Calendar' : activePath === '/settings' ? 'Settings' : 'Overview'}</p>
          <span className="avatar" aria-label="Jordan Davis">JD</span>
        </header>
        <div className="mobile-header">
          <Brand />
          <span className="avatar" aria-label="Jordan Davis">JD</span>
        </div>
        {children}
      </div>
      <nav className="mobile-navigation" aria-label="Primary navigation">
        {navigation.map(({ path, label, icon: Icon }) => (
          <button
            type="button"
            key={path}
            className={`mobile-nav-link ${activePath === path ? 'is-active' : ''}`}
            aria-current={activePath === path ? 'page' : undefined}
            onClick={() => {
              navigate(path)
              if (path === '/tasks') {
                window.setTimeout(() => document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' }), 0)
              } else if (path === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label === 'My tasks' ? 'Tasks' : label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function FocusBoardApp() {
  const { dispatch, trashTask, tasks } = useTaskContext()
  const [formTask, setFormTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const openCreateModal = () => setFormTask({ isNew: true })
  const saveTask = values => {
    const today = new Date().toISOString().slice(0, 10)
    if (formTask?.id) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: formTask.id, changes: { ...values, updatedAt: today } } })
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          ...values,
          id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`,
          createdAt: today,
          updatedAt: today,
        },
      })
    }
    setFormTask(null)
    setToast(formTask?.id ? 'Task updated' : 'Task created')
    window.setTimeout(() => setToast(''), 2400)
  }

  const page = location.pathname === '/calendar' || location.pathname === '/settings'
    ? (
      <main className="placeholder-page" id="main-content">
        <span className="placeholder-icon">{location.pathname === '/calendar' ? <CalendarDays /> : <Settings />}</span>
        <p className="eyebrow">WORKSPACE</p>
        <h1>{location.pathname === '/calendar' ? 'Calendar' : 'Settings'}</h1>
        <p>This section is a placeholder for the current FocusBoard assessment scope.</p>
        <button type="button" className="primary-button" onClick={() => navigate('/')}>Back to overview</button>
      </main>
    )
    : <Dashboard onAddTask={openCreateModal} onEditTask={setFormTask} onDeleteTask={setDeleteTarget} />

  return (
    <AppFrame>
      {page}
      {formTask && (
        <TaskModal
          task={formTask.isNew ? null : formTask}
          onClose={() => setFormTask(null)}
          onSave={saveTask}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          task={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            trashTask(deleteTarget.id)
            setDeleteTarget(null)
            setToast('Task deleted')
            window.setTimeout(() => setToast(''), 2400)
          }}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
      <span className="sr-only" aria-live="polite">{tasks.length} tasks</span>
    </AppFrame>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <FocusBoardApp />
      </TaskProvider>
    </BrowserRouter>
  )
}
