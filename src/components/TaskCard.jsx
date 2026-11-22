import { CalendarDays, Check, MoreHorizontal } from 'lucide-react'

const NEXT_STATUS = {
  'To do': 'In progress',
  'In progress': 'Completed',
  Completed: 'To do',
}

function formatDueDate(value) {
  if (!value) return 'No date'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? 'No date'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TaskCard({ task, onUpdateStatus, onEdit, onDelete }) {
  const categoryClass = task.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const closeMenu = event => {
    event.currentTarget.closest('details')?.removeAttribute('open')
  }

  return (
    <article className={`task-row ${task.status === 'Completed' ? 'task-completed' : ''}`}>
      <div className="task-main-cell">
        <button
          type="button"
          className={`task-status-button ${task.status === 'Completed' ? 'is-completed' : ''}`}
          onClick={() => onUpdateStatus(task.id, NEXT_STATUS[task.status] || 'To do')}
          aria-label={`Current status ${task.status}. Move ${task.title} to ${NEXT_STATUS[task.status] || 'To do'}`}
          title={`Move to ${NEXT_STATUS[task.status] || 'To do'}`}
        >
          {task.status === 'Completed' ? <Check size={14} /> : null}
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
        <details className="task-menu">
          <summary aria-label={`Actions for ${task.title}`} title="Task actions"><MoreHorizontal size={19} /></summary>
          <div className="task-menu-items" aria-label={`${task.title} actions`}>
            <button type="button" onClick={event => { closeMenu(event); onEdit(task) }}>Edit task</button>
            <button type="button" className="menu-delete" onClick={event => { closeMenu(event); onDelete(task) }}>Delete task</button>
          </div>
        </details>
      </div>
    </article>
  )
}
