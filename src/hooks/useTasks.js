import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { initialTasks } from '../data/initialTasks'
import { calculateNextOccurrence, getRecurrenceId } from '../utils/recurrence'

export const STORAGE_KEY = 'focusboard_tasks'
export const TRASH_STORAGE_KEY = 'focusboard_deleted_tasks'
export const ACTIVITY_STORAGE_KEY = 'focusboard_activity'
const LEGACY_STORAGE_KEY = 'focusboard_tasks_v1'
const STATUS_VALUES = ['To do', 'In progress', 'Completed']
const PRIORITY_VALUES = ['Low', 'Medium', 'High']

function isValidTaskList(value) {
  if (!Array.isArray(value)) return false
  const seenIds = new Set()
  return value.every(task => {
    if (!task || typeof task.id !== 'string' || !task.id || seenIds.has(task.id)) return false
    seenIds.add(task.id)
    const validDueDate = task.dueDate === ''
      || (
        typeof task.dueDate === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) &&
        !Number.isNaN(new Date(`${task.dueDate}T00:00:00Z`).getTime()) &&
        new Date(`${task.dueDate}T00:00:00Z`).toISOString().slice(0, 10) === task.dueDate
      )
    return (
      typeof task.title === 'string' &&
      task.title.trim().length > 0 &&
      typeof task.description === 'string' &&
      typeof task.category === 'string' &&
      validDueDate &&
      STATUS_VALUES.includes(task.status) &&
      PRIORITY_VALUES.includes(task.priority)
    )
  })
}

function normalizeTasks(tasks) {
  return tasks.map(task => ({
    ...task,
    description: task.description || '',
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
    recurrence: task.recurrence || 'None',
    recurrenceWeekdays: Array.isArray(task.recurrenceWeekdays) ? task.recurrenceWeekdays : [],
    projectId: task.projectId || '',
    estimatedMinutes: Number.isFinite(task.estimatedMinutes) ? task.estimatedMinutes : 30,
    actualMinutes: Number.isFinite(task.actualMinutes) ? task.actualMinutes : 0,
    eisenhower: task.eisenhower || 'Important but Not Urgent',
    dependencyIds: Array.isArray(task.dependencyIds) ? task.dependencyIds : [],
    createdAt: task.createdAt || task.dueDate,
    updatedAt: task.updatedAt || task.dueDate,
  }))
}

function loadTaskState() {
  if (typeof window === 'undefined') {
    return { tasks: normalizeTasks(initialTasks), persistOnMount: false }
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      return isValidTaskList(parsed)
        ? { tasks: normalizeTasks(parsed), persistOnMount: true }
        : { tasks: [], persistOnMount: false }
    } else {
      const legacySaved = window.localStorage.getItem(LEGACY_STORAGE_KEY)
      if (legacySaved !== null) {
        const legacyParsed = JSON.parse(legacySaved)
        return isValidTaskList(legacyParsed)
          ? { tasks: normalizeTasks(legacyParsed), persistOnMount: true }
          : { tasks: [], persistOnMount: false }
      }
    }
  } catch {
    return { tasks: [], persistOnMount: false }
  }
  return { tasks: normalizeTasks(initialTasks), persistOnMount: true }
}

function taskReducer(tasks, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return [...tasks, action.payload]
    case 'UPDATE_TASK':
      return tasks.map(task => task.id === action.payload.id
        ? {
            ...task,
            ...action.payload.changes,
            updatedAt: action.payload.changes.updatedAt || new Date().toISOString().slice(0, 10),
          }
        : task)
    case 'DELETE_TASK':
      return tasks.filter(task => task.id !== action.payload)
    case 'BULK_DELETE':
      return tasks.filter(task => !action.payload.includes(task.id))
    case 'UPDATE_STATUS':
      {
        const completedDate = new Date().toISOString().slice(0, 10)
        const target = tasks.find(task => task.id === action.payload.id)
        if (
          action.payload.status === 'Completed' &&
          target &&
          (target.dependencyIds || []).some(dependencyId =>
            tasks.find(task => task.id === dependencyId)?.status !== 'Completed',
          )
        ) {
          return tasks
        }
        const updated = tasks.map(task => task.id === action.payload.id
          ? { ...task, status: action.payload.status, updatedAt: completedDate }
          : task)
        if (
          action.payload.status !== 'Completed' ||
          !target ||
          target.status === 'Completed' ||
          !target.recurrence ||
          target.recurrence === 'None'
        ) {
          return updated
        }

        const nextDate = calculateNextOccurrence(target, target.dueDate)
        if (!nextDate) return updated
        const recurrenceId = getRecurrenceId(target)
        const alreadyExists = tasks.some(task =>
          task.recurrenceId === recurrenceId && task.occurrenceDate === nextDate,
        )
        if (alreadyExists) return updated

        const nextTask = {
          ...target,
          id: `recurrence-${recurrenceId}-${nextDate}`,
          status: 'To do',
          dueDate: nextDate,
          recurrenceId,
          occurrenceDate: nextDate,
          subtasks: (target.subtasks || []).map(subtask => ({ ...subtask, completed: false })),
          createdAt: completedDate,
          updatedAt: completedDate,
        }
        return [...updated, nextTask]
      }
    default:
      return tasks
  }
}

export function useTasks() {
  const [initialTaskState] = useState(loadTaskState)
  const [tasks, dispatch] = useReducer(taskReducer, initialTaskState.tasks)
  const [deletedTasks, setDeletedTasks] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'LOAD':
          return action.payload
        case 'ADD':
          return [...action.payload, ...state.filter(task => !action.payload.some(item => item.id === task.id))]
        case 'REMOVE':
          return state.filter(task => task.id !== action.payload)
        case 'CLEAR':
          return []
        default:
          return state
      }
    },
    undefined,
    () => {
      try {
        const saved = window.localStorage.getItem(TRASH_STORAGE_KEY)
        const parsed = saved ? JSON.parse(saved) : []
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    },
  )
  const [activity, setActivity] = useState(() => {
    try {
      const saved = window.localStorage.getItem(ACTIVITY_STORAGE_KEY)
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(deletedTasks))
    } catch {
      // Trash remains usable for the current session.
    }
  }, [deletedTasks])

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity))
    } catch {
      // Activity remains usable for the current session.
    }
  }, [activity])

  useEffect(() => {
    if (!initialTaskState.persistOnMount && tasks === initialTaskState.tasks) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // The app remains usable when storage is unavailable.
    }
  }, [initialTaskState.persistOnMount, initialTaskState.tasks, tasks])

  const addTask = useCallback(task => dispatch({ type: 'ADD_TASK', payload: task }), [])
  const updateTask = useCallback((id, changes) => {
    dispatch({ type: 'UPDATE_TASK', payload: { id, changes } })
  }, [])
  const deleteTask = useCallback(id => dispatch({ type: 'DELETE_TASK', payload: id }), [])
  const updateStatus = useCallback((id, status) => {
    dispatch({ type: 'UPDATE_STATUS', payload: { id, status } })
  }, [])
  const addActivity = useCallback(message => {
    setActivity(current => [{
      id: globalThis.crypto?.randomUUID?.() || `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message,
    }, ...current].slice(0, 100))
  }, [])
  const trashTask = useCallback(id => {
    const task = tasks.find(item => item.id === id)
    if (!task) return
    setDeletedTasks({ type: 'ADD', payload: [{ ...task, deletedAt: new Date().toISOString() }] })
    dispatch({ type: 'DELETE_TASK', payload: id })
    setActivity(current => [{
      id: globalThis.crypto?.randomUUID?.() || `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Moved "${task.title}" to Recently Deleted`,
    }, ...current].slice(0, 100))
  }, [tasks])
  const trashTasks = useCallback(ids => {
    const removed = tasks.filter(task => ids.includes(task.id)).map(task => ({
      ...task,
      deletedAt: new Date().toISOString(),
    }))
    if (!removed.length) return
    setDeletedTasks({ type: 'ADD', payload: removed })
    dispatch({ type: 'BULK_DELETE', payload: ids })
    setActivity(current => [{
      id: globalThis.crypto?.randomUUID?.() || `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Moved ${removed.length} tasks to Recently Deleted`,
    }, ...current].slice(0, 100))
  }, [tasks])
  const restoreTask = useCallback(id => {
    const task = deletedTasks.find(item => item.id === id)
    if (!task) return
    const restored = { ...task }
    delete restored.deletedAt
    dispatch({ type: 'ADD_TASK', payload: restored })
    setDeletedTasks({ type: 'REMOVE', payload: id })
    setActivity(current => [{
      id: globalThis.crypto?.randomUUID?.() || `activity-${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: `Restored "${restored.title}"`,
    }, ...current].slice(0, 100))
  }, [deletedTasks])
  const clearTrash = useCallback(() => setDeletedTasks({ type: 'CLEAR' }), [])

  return useMemo(
    () => ({
      tasks,
      dispatch,
      deletedTasks,
      activity,
      addTask,
      updateTask,
      deleteTask,
      updateStatus,
      addActivity,
      trashTask,
      trashTasks,
      restoreTask,
      clearTrash,
    }),
    [tasks, dispatch, deletedTasks, activity, addTask, updateTask, deleteTask, updateStatus, addActivity, trashTask, trashTasks, restoreTask, clearTrash],
  )
}
