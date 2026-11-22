# FocusBoard

FocusBoard is a responsive, frontend-only productivity dashboard for planning work, tracking habits, managing projects, and reviewing focus activity. It supports task creation and editing, status changes, filtering, focus notes, recurring tasks, and local browser persistence.

## Repository

- **GitHub:** https://github.com/Appireddy-Hemanth/mobile-Application

No public hosted demo is claimed until the application is deployed successfully.

## Screenshots

### Desktop

![FocusBoard desktop dashboard](./screenshots/desktop.png)

### Mobile

![FocusBoard mobile dashboard](./screenshots/mobile.png)

## Overview

FocusBoard combines task management with lightweight productivity and well-being tools in one browser-based workspace. Data is stored locally, so no account or backend is required.

## Features

- Create, edit, delete, and complete tasks through accessible dialogs
- Track total, in-progress, completed, and overall completion statistics
- Search task titles case-insensitively
- Combine status and priority filters
- Change task status inline from task rows
- Browse a three-slide Focus Notes carousel with keyboard and pagination controls
- Persist task and filter state safely in browser `localStorage`
- Use responsive layouts at 1440px desktop, 768px tablet, and 390px mobile widths
- Provide visible keyboard focus states and screen-reader labels
- Advanced dashboard cards for pending, overdue, weekly productivity, priority distribution, and recently updated tasks
- Kanban drag-and-drop workflow for To Do, In Progress, and Completed
- Monthly and weekly calendar navigation with overdue highlighting
- Category, due-date, and sorting controls with bulk selection
- Subtask progress tracking
- Recently deleted tasks with restoration
- Configurable Pomodoro focus timer and activity tracking
- Light/dark themes and configurable dashboard widgets
- Custom task categories
- Polished SaaS focus states, tooltips, confirmations, loading feedback, validation alerts, toasts, and dark-mode surfaces
- Local rule-based AI-style recommendations with clearly disclosed frontend limitations
- XP, levels, achievement badges, and duplicate-reward protection
- Enhanced habits with metadata, streaks, history, weekly/monthly progress, editing, and deletion
- Projects, habit tracking, rule-based productivity assistant, analytics, and achievements
- Monthly/weekly calendar, Kanban drag-and-drop, and Pomodoro focus center
- CSV and JSON export, plus validated JSON import
- Eisenhower priority matrix, goal milestones, quick capture inbox, mood and energy tracking
- Deep work mode, workload balance, and weekly productivity review
- Task estimates, actual time, dependencies, recurrence settings, and project assignment
- Recurring tasks, project assignment, recently deleted task restoration, and permanent trash deletion

## Tech Stack

- React 19
- Vite
- JavaScript and JSDoc
- CSS3 responsive layout and Lucide React icons
- Browser `localStorage`
- Vitest and Testing Library

No external state management library or backend is required.

## Local Setup

Requirements: Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## Production Deployment

Build and deploy the generated `dist/` directory with a static host:

```bash
npm run build
```

Configure the host to serve `index.html` as the fallback for React Router paths. When deployed, add the verified hosted URL above. No live URL is claimed until deployment succeeds.

### GitHub Pages

GitHub Pages needs a static-host fallback for direct React Router URLs. Configure the deployment workflow or host rewrite rules to serve `index.html` for application routes.

### GitHub setup

After creating a repository on GitHub:

```bash
git init
git add .
git commit -m "feat: complete FocusBoard application"
git branch -M main
git remote add origin https://github.com/Appireddy-Hemanth/FocusBoard.git
git push -u origin main
```

## Routes

- `/` Dashboard
- `/tasks` My Tasks
- `/projects` Projects
- `/kanban` Kanban
- `/calendar` Calendar
- `/habits` Habit Tracker
- `/focus` Focus Timer
- `/assistant` AI Productivity Assistant
- `/analytics` Analytics
- `/achievements` Achievements
- `/settings` Settings
- `/notes` Focus Notes
- `/eisenhower` Eisenhower Priority Matrix
- `/goals` Goals and Milestones
- `/inbox` Quick Capture Inbox
- `/mood` Mood and Energy
- `/deep-work` Deep Work
- `/weekly-review` Weekly Productivity Review
- `/workload` Workload Balance

## Testing

```bash
npm test
npm run test:watch
```

## State Management Architecture

`TaskContext` is the single source of truth for tasks, filters, search text, and derived dashboard values:

- `useReducer` applies immutable `ADD_TASK`, `UPDATE_TASK`, `DELETE_TASK`, and `UPDATE_STATUS` actions.
- `useMemo` derives total tasks, in-progress tasks, completed tasks, completion percentage, and filtered tasks.
- `useLocalStorage` restores saved state and synchronizes task changes without requiring a separate data store.

This approach is intentionally used instead of Redux or another external state library because the app is a single-user dashboard with a small, strongly related state model. Context avoids unnecessary prop drilling, `useReducer` keeps updates predictable, and `useMemo` prevents repeated derived calculations.

Persisted task data uses the exact key `focusboard_tasks`. On startup, saved JSON is checked and validated before use. An empty saved array remains valid and is preserved. Corrupt or invalid saved task data falls back to the sample task collection, while valid saved data is preserved across refreshes.

## Project Structure

```text
src/
  components/       Dashboard UI and task dialogs
  context/          Task context and provider
  data/             Initial tasks and Focus Notes content
  hooks/            Safe localStorage hook
  pages/            Dashboard composition
  types/            JSDoc task types
  App.jsx
  App.css
  index.css
  main.jsx
```

## Scope and Limitations

- This is a frontend-only application; task data is stored only in the current browser.
- Exact Figma frame fidelity could not be independently verified because no actual exported frames or accessible Figma URLs were provided. The implementation uses the existing dashboard layout and design tokens visible in the workspace.
- The AI assistant is a transparent local rule-based productivity assistant. It does not call an external AI API or require credentials.
- Notifications are frontend-generated from actual task status and deadline data.
- Clearing browser storage removes saved tasks and restores the sample task collection.

