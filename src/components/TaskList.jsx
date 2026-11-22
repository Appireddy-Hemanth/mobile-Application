import { CalendarDays, ListTodo, Plus } from 'lucide-react'
import TaskCard from './TaskCard'

export default function TaskList({ tasks, activeTabId, onEdit, onDelete, onUpdateStatus, onAdd, onReset }) {
  return (
    <div className="task-list" id="task-list-panel" role="tabpanel" aria-labelledby={activeTabId} tabIndex={0} aria-live="polite">
      {tasks.length > 0 && (
        <div className="task-list-labels" aria-hidden="true">
          <span>Task</span><span>Category</span><span>Priority</span><span>Due date</span><span />
        </div>
      )}
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
      {tasks.length === 0 && (
        <div className="empty-tasks">
          <span className="empty-icon"><ListTodo size={22} /></span>
          <h3>No tasks found</h3>
          <p>Try changing your filters or add a new task to get started.</p>
          <div className="empty-actions">
            <button type="button" className="secondary-button" onClick={onReset}>Clear filters</button>
            <button type="button" className="primary-button" onClick={onAdd}><Plus size={16} />New task</button>
          </div>
        </div>
      )}
      <span className="sr-only"><CalendarDays size={1} />{tasks.length} tasks shown</span>
    </div>
  )
}
