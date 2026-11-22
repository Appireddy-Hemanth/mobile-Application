/**
 * @typedef {'To do' | 'In progress' | 'Completed'} TaskStatus
 * @typedef {'Low' | 'Medium' | 'High'} TaskPriority
 *
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {TaskStatus} status
 * @property {TaskPriority} priority
 * @property {string} dueDate
 * @property {string} createdAt
 * @property {string} updatedAt
 *
 * @typedef {Omit<Task, 'id'> & { id?: string }} TaskInput
 */
