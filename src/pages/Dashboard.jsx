import { useMemo, useRef } from 'react'
import { CheckCircle2, CircleDashed, ListTodo, Plus, Search, Sparkles } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import FocusNotesCarousel from '../components/FocusNotesCarousel'
import TaskList from '../components/TaskList'

const TABS = ['All', 'In progress', 'Completed']

export default function Dashboard({ onAddTask, onEditTask, onDeleteTask }) {
  const tabRefs = useRef([])
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
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  const handleTabKeyDown = (event, index) => {
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % TABS.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + TABS.length) % TABS.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = TABS.length - 1
    else return
    event.preventDefault()
    setStatusFilter(TABS[nextIndex])
    tabRefs.current[nextIndex]?.focus()
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
          <h1>
            <span className="desktop-title">Your work, in focus.</span>
            <span className="mobile-title">Your work<br />in focus.</span>
          </h1>
          <p className="hero-subtitle">
            <span className="desktop-subtitle">Plan your day, stay organized, and celebrate small wins.</span>
            <span className="mobile-subtitle">Stay organized and keep moving forward.</span>
          </p>
        </div>
        <button type="button" className="primary-button new-task-button" onClick={onAddTask} aria-label="New task">
          <Plus size={18} aria-hidden="true" /><span>New task</span>
        </button>
      </section>

      <FocusNotesCarousel pendingCount={pendingCount} completionPercentage={completionPercentage} />

      <h2 className="stats-heading">Overview</h2>
      <section className="stats-grid" aria-label="Task overview">
        {stats.map(({ title, count, supporting, icon: Icon, tone }) => (
          <article className={`stat-card ${tone}`} key={title}>
            <div className="stat-top">
              <span className="stat-icon"><Icon size={19} aria-hidden="true" /></span>
              <p>{title}</p>
            </div>
            <div className="stat-value-row"><strong>{count}</strong><small>{supporting}</small></div>
          </article>
        ))}
      </section>

      <section className="tasks-section" id="tasks" aria-labelledby="tasks-title">
        <header className="tasks-section-heading">
          <div>
            <h2 id="tasks-title" tabIndex={-1}>My tasks</h2>
            <p>
              <span className="desktop-subtitle">Manage and track everything in one place.</span>
              <span className="mobile-subtitle">Your priorities for this week</span>
            </p>
          </div>
          <button type="button" className="text-button" onClick={resetFilters}>View all tasks</button>
          <button type="button" className="primary-button mobile-new-task-button" onClick={onAddTask} aria-label="New task">
            <Plus size={19} aria-hidden="true" />
          </button>
        </header>

        <div className="task-toolbar">
          <div className="task-tabs" role="tablist" aria-label="Filter tasks by status">
            {TABS.map(tab => {
              const count = tab === 'All'
                ? totalCount
                : tasks.filter(task => task.status === tab).length
              return (
                <button
                  ref={element => { tabRefs.current[TABS.indexOf(tab)] = element }}
                  type="button"
                  role="tab"
                  key={tab}
                  id={`task-filter-tab-${TABS.indexOf(tab)}`}
                  aria-controls="task-list-panel"
                  aria-selected={statusFilter === tab}
                  tabIndex={statusFilter === tab ? 0 : -1}
                  className={statusFilter === tab ? 'is-selected' : ''}
                  onClick={() => setStatusFilter(tab)}
                  onKeyDown={event => handleTabKeyDown(event, TABS.indexOf(tab))}
                >
                  <span className="desktop-tab-label">{tab === 'All' ? 'All tasks' : tab}</span>
                  <span className="mobile-tab-label">{tab === 'All' ? 'All' : tab}</span>
                  <span>{count}</span>
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
          activeTabId={`task-filter-tab-${TABS.indexOf(statusFilter)}`}
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
