import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, MoreHorizontal } from 'lucide-react'

function formatDueDate(value) {
  if (!value) return 'No date'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? 'No date'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskCard({ task, onUpdateStatus, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const actionRef = useRef(null)
  const categoryClass = task.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const isCompleted = task.status === 'Completed'

  useEffect(() => {
    if (!menuOpen) return undefined
    const closeOnOutsideClick = event => {
      if (!actionRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        actionRef.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [menuOpen])

  return (
    <article className={`task-row ${task.status === 'Completed' ? 'task-completed' : ''}`}>
      <div className="task-main-cell">
        <button
          type="button"
          className={`task-status-button ${isCompleted ? 'is-completed' : ''}`}
          onClick={() => onUpdateStatus(task.id, isCompleted ? 'To do' : 'Completed')}
          aria-label={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'completed'}`}
          title={`Mark ${isCompleted ? 'incomplete' : 'completed'}`}
        >
          {isCompleted ? <Check size={14} /> : null}
        </button>
        <div className="task-copy">
          <strong>{task.title}</strong>
          {task.description && <p>{task.description}</p>}
          <span className="mobile-task-status">{task.status}</span>
        </div>
      </div>
      <div className="task-category-cell"><span className={`category-badge category-${categoryClass}`}>{task.category}</span></div>
      <div className="task-priority-cell"><span className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span></div>
      <time className="task-due-cell" dateTime={task.dueDate || undefined}>
        <CalendarDays size={15} aria-hidden="true" />{formatDueDate(task.dueDate)}
      </time>
      <div className="task-action-cell">
        <div className="task-menu" ref={actionRef}>
          <button
            type="button"
            className="task-menu-trigger"
            aria-label={`Actions for ${task.title}`}
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? `task-actions-${task.id}` : undefined}
            title="Task actions"
            onClick={() => setMenuOpen(open => !open)}
          >
            <MoreHorizontal size={19} />
          </button>
          {menuOpen && (
            <div className="task-menu-items" id={`task-actions-${task.id}`} aria-label={`${task.title} actions`}>
              <button type="button" onClick={() => { setMenuOpen(false); onEdit(task) }}>Edit task</button>
              <button
                type="button"
                className="menu-delete"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete(task)
                }}
              >
                Delete task
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
