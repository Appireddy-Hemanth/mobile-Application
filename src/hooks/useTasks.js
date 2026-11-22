import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { initialTasks } from '../data/initialTasks'

export const STORAGE_KEY = 'focusboard_tasks'
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
    }

    const legacySaved = window.localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacySaved !== null) {
      const legacyParsed = JSON.parse(legacySaved)
      return isValidTaskList(legacyParsed)
        ? { tasks: normalizeTasks(legacyParsed), persistOnMount: true }
        : { tasks: [], persistOnMount: false }
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
    case 'UPDATE_STATUS': {
      const updatedAt = new Date().toISOString().slice(0, 10)
      return tasks.map(task => task.id === action.payload.id
        ? { ...task, status: action.payload.status, updatedAt }
        : task)
    }
    default:
      return tasks
  }
}

export function useTasks() {
  const [initialTaskState] = useState(loadTaskState)
  const [tasks, dispatch] = useReducer(taskReducer, initialTaskState.tasks)

  useEffect(() => {
    if (!initialTaskState.persistOnMount && tasks === initialTaskState.tasks) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // The app remains usable when browser storage is unavailable.
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

  return useMemo(
    () => ({ tasks, addTask, updateTask, deleteTask, updateStatus }),
    [tasks, addTask, updateTask, deleteTask, updateStatus],
  )
}
