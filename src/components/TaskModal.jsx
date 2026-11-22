import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = ['Design', 'Development', 'Content']
const STATUSES = ['To do', 'In progress', 'Completed']
const PRIORITIES = ['High', 'Medium', 'Low']

export default function TaskModal({ task = null, onClose, onSave }) {
  const [values, setValues] = useState(() => task ? { ...task } : {
    title: '',
    description: '',
    category: 'Design',
    status: 'To do',
    priority: 'Medium',
    dueDate: '',
  })
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const previousFocusRef = useRef(null)
  const closeRef = useRef(onClose)

  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    titleRef.current?.focus()
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [...dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])',
      )]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus?.()
    }
  }, [])

  const updateField = (field, value) => {
    setValues(current => ({ ...current, [field]: value }))
    if (field === 'title' && error) setError('')
  }

  const submit = event => {
    event.preventDefault()
    const title = values.title.trim()
    if (!title) {
      setError('Please enter a task title.')
      titleRef.current?.focus()
      return
    }
    onSave({
      ...values,
      title,
      description: values.description.trim(),
      category: values.category || CATEGORIES[0],
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} className="task-modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <header className="modal-header">
          <div><p>TASK DETAILS</p><h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2></div>
          <button type="button" className="modal-close" aria-label="Close task form" onClick={onClose}><X size={19} /></button>
        </header>
        <form onSubmit={submit} noValidate>
          <label className="form-label" htmlFor="task-title">Title <span>*</span></label>
          <input
            ref={titleRef}
            id="task-title"
            value={values.title}
            onChange={event => updateField('title', event.target.value)}
            placeholder="What needs to be done?"
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'task-title-error' : undefined}
          />
          {error && <small id="task-title-error" className="form-error" role="alert">{error}</small>}

          <label className="form-label" htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            rows={3}
            value={values.description}
            onChange={event => updateField('description', event.target.value)}
            placeholder="Add a few details..."
          />

          <div className="modal-field-grid">
            <div>
              <label className="form-label" htmlFor="task-category">Category</label>
              <select id="task-category" value={values.category || 'Design'} onChange={event => updateField('category', event.target.value)}>
                {values.category && !CATEGORIES.includes(values.category) && <option value={values.category}>{values.category}</option>}
                {CATEGORIES.map(category => <option value={category} key={category}>{category}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="task-status">Status</label>
              <select id="task-status" value={values.status} onChange={event => updateField('status', event.target.value)}>
                {STATUSES.map(status => <option value={status} key={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={values.priority} onChange={event => updateField('priority', event.target.value)}>
                {PRIORITIES.map(priority => <option value={priority} key={priority}>{priority}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label" htmlFor="task-due-date">Due date</label>
              <input id="task-due-date" type="date" value={values.dueDate || ''} onChange={event => updateField('dueDate', event.target.value)} />
            </div>
          </div>
          <footer className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-button">{task ? 'Save changes' : 'Create task'}</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
