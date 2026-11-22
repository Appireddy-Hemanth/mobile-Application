import { useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTasks } from '../hooks/useTasks'
import { TaskContext } from './taskContext.js'

const STATUS_VALUES = ['To do', 'In progress', 'Completed']
const PRIORITY_VALUES = ['Low', 'Medium', 'High']

export function TaskProvider({ children }) {
  const taskState = useTasks()
  const { tasks } = taskState
  const [searchQuery, setSearchQuery] = useLocalStorage('focusboard_search_v1', '', value => typeof value === 'string')
  const [statusFilter, setStatusFilter] = useLocalStorage(
    'focusboard_status_filter_v1',
    'All',
    value => ['All', ...STATUS_VALUES].includes(value),
  )
  const [priorityFilter, setPriorityFilter] = useLocalStorage(
    'focusboard_priority_filter_v1',
    'All',
    value => ['All', ...PRIORITY_VALUES].includes(value),
  )

  const totalCount = tasks.length
  const inProgressCount = tasks.filter(task => task.status === 'In progress').length
  const completedCount = tasks.filter(task => task.status === 'Completed').length
  const pendingCount = tasks.filter(task => task.status === 'To do').length
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)

  const value = useMemo(() => ({
    ...taskState,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    totalCount,
    inProgressCount,
    completedCount,
    pendingCount,
    completionPercentage,
  }), [
    taskState,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    totalCount,
    inProgressCount,
    completedCount,
    pendingCount,
    completionPercentage,
  ])

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
