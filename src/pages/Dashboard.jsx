import { useMemo } from 'react'
import { ArrowUpRight, CheckCircle2, CircleDashed, ListTodo, Plus, Search, Sparkles } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import FocusNotesCarousel from '../components/FocusNotesCarousel'
import TaskList from '../components/TaskList'

const TABS = ['All', 'To do', 'In progress', 'Completed']

export default function Dashboard({ onAddTask, onEditTask, onDeleteTask }) {
  const {
    tasks,
    dispatch,
    totalCount,
    inProgressCount,
    completedCount,
    pendingCount,
    completionPercentage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
  } = useTaskContext()

  const visibleTasks = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase()
    return tasks
      .filter(task => !query || task.title.toLocaleLowerCase().includes(query))
      .filter(task => statusFilter === 'All' || task.status === statusFilter)
      .filter(task => priorityFilter === 'All' || task.priority === priorityFilter)
      .sort((a, b) => (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31'))
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  const changeStatus = (id, status) => dispatch({ type: 'UPDATE_STATUS', payload: { id, status } })
  const stats = [
    { title: 'Total tasks', count: totalCount, supporting: 'Across all projects', icon: ListTodo, tone: 'purple' },
    { title: 'In progress', count: inProgressCount, supporting: 'Keep the momentum', icon: CircleDashed, tone: 'blue' },
    { title: 'Completed', count: completedCount, supporting: 'Great work this week', icon: CheckCircle2, tone: 'green' },
  ]

  return (
    <main className="dashboard" id="main-content">
      <section className="hero">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Your work, in focus.</h1>
          <p className="hero-subtitle">Plan your day, stay organized, and celebrate small wins.</p>
        </div>
        <button type="button" className="primary-button new-task-button" onClick={onAddTask}>
          <Plus size={18} aria-hidden="true" /><span>New task</span>
        </button>
      </section>

      <FocusNotesCarousel tasks={tasks} pendingCount={pendingCount} completionPercentage={completionPercentage} />

      <section className="stats-grid" aria-label="Task overview">
        {stats.map(({ title, count, supporting, icon: Icon, tone }) => (
          <article className={`stat-card ${tone}`} key={title}>
            <div className="stat-top"><span className="stat-icon"><Icon size={19} aria-hidden="true" /></span><ArrowUpRight size={16} className="stat-arrow" aria-hidden="true" /></div>
            <p>{title}</p>
            <strong>{count}</strong>
            <small>{supporting}</small>
          </article>
        ))}
      </section>

      <section className="tasks-section" id="tasks" aria-labelledby="tasks-title">
        <header className="tasks-section-heading">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h2 id="tasks-title">My tasks</h2>
            <p>Manage and track everything in one place.</p>
          </div>
          <button type="button" className="text-button" onClick={resetFilters}>View all tasks <ArrowUpRight size={15} /></button>
        </header>

        <div className="task-toolbar">
          <div className="task-tabs" role="tablist" aria-label="Filter tasks by status">
            {TABS.map(tab => {
              const count = tab === 'All'
                ? totalCount
                : tasks.filter(task => task.status === tab).length
              return (
                <button
                  type="button"
                  role="tab"
                  key={tab}
                  aria-selected={statusFilter === tab}
                  className={statusFilter === tab ? 'is-selected' : ''}
                  onClick={() => setStatusFilter(tab)}
                >
                  {tab}<span>{count}</span>
                </button>
              )
            })}
          </div>
          <div className="task-filters">
            <label className="search-field">
              <Search size={17} aria-hidden="true" />
              <span className="sr-only">Find a task</span>
              <input
                type="search"
                placeholder="Find a task..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                aria-label="Find a task"
              />
            </label>
            <label className="priority-field">
              <span className="sr-only">Filter by priority</span>
              <select value={priorityFilter} onChange={event => setPriorityFilter(event.target.value)} aria-label="Filter by priority">
                <option value="All">Priority: All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </label>
          </div>
        </div>

        <TaskList
          tasks={visibleTasks}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdateStatus={changeStatus}
          onAdd={onAddTask}
          onReset={resetFilters}
        />
      </section>

      <footer className="dashboard-footer"><Sparkles size={15} /> One task at a time. You’re making progress.</footer>
    </main>
  )
}
