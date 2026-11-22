# FocusBoard

<div align="center">

**A polished, responsive productivity workspace for planning tasks, building habits, and protecting focused time.**

[![CI](https://github.com/Appireddy-Hemanth/mobile-Application/actions/workflows/ci.yml/badge.svg)](https://github.com/Appireddy-Hemanth/mobile-Application/actions/workflows/ci.yml)
[![React](https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/license-not%20specified-lightgrey)](#license)

[Explore the Features](#-feature-set) • [View Screenshots](#-screenshots) • [Quick Start](#-quick-start) • [Architecture](#-architecture)

</div>

---

## Overview

**FocusBoard** is a frontend-only productivity application that brings task planning, project management, habit tracking, focus sessions, analytics, and weekly reviews into one cohesive workspace.

It is designed to feel like a lightweight personal productivity suite:

- Fast enough for everyday planning
- Structured enough for larger workflows
- Accessible on desktop, tablet, and mobile
- Private by default because data stays in the browser

> [!NOTE]
> FocusBoard does not require a backend or account. The assistant is intentionally local and rule-based rather than connected to an external AI service.

---

## Screenshots

### Desktop experience

![FocusBoard desktop dashboard](./screenshots/desktop.png)

### Mobile experience

<div align="center">
  <img src="./screenshots/mobile.png" alt="FocusBoard mobile dashboard" width="390">
</div>

---

## ✨ Feature Set

| Area | Capabilities |
|---|---|
| **Tasks** | Create, edit, delete, complete, search, filter, sort, bulk-select, estimate time, track actual time, and organize subtasks |
| **Planning** | Kanban board, monthly/weekly calendar, Eisenhower matrix, projects, goals, milestones, inbox, and workload view |
| **Focus** | Configurable Pomodoro timer, deep-work mode, focus session history, and focus notes |
| **Habits** | Daily, weekday, weekly, three-times-weekly, and custom goals with streaks and completion history |
| **Productivity insights** | Completion metrics, weekly charts, priority distribution, overdue counts, recent activity, and weekly review |
| **Engagement** | XP, levels, achievements, and duplicate-reward protection |
| **Personalization** | Light and dark themes, configurable dashboard widgets, custom categories, and notification preferences |
| **Data management** | Validated JSON import, CSV export, JSON export, recently deleted task restoration, and permanent trash deletion |
| **Assistant** | Transparent local, rule-based productivity suggestions using task and habit data already in the browser |

### Core task workflow

- Accessible task and confirmation dialogs
- Status updates for **To do**, **In progress**, and **Completed**
- Priority levels for **Low**, **Medium**, and **High**
- Due dates and overdue highlighting
- Dependencies and recurring task support
- Project assignment and Eisenhower categorization
- Safe browser persistence with validation and fallback behavior

---

## Product Highlights

### Dashboard

The dashboard surfaces total tasks, active work, completed work, completion percentage, pending tasks, overdue tasks, weekly productivity, priority distribution, and recent activity at a glance.

### Planning views

- **Kanban:** Drag and drop work across To do, In progress, and Completed
- **Calendar:** Navigate monthly and weekly schedules
- **Eisenhower:** Separate work by urgency and importance
- **Projects:** Assign and review tasks by project
- **Inbox:** Capture ideas quickly and convert them into actionable tasks

### Focus and consistency

- Focus sessions feed directly into productivity and weekly-review views
- Habits support flexible schedules and streak calculations
- Mood and energy tracking provides a lightweight personal check-in experience
- Weekly reviews combine task, focus, and habit activity

### Data and privacy

The application stores its data in browser `localStorage`. It does not send task information to a server or external AI provider. Clearing site data removes saved application state and restores sample data.

---

## Tech Stack

| Category | Technology |
|---|---|
| UI | React 19 |
| Build | Vite 8 |
| Language | JavaScript with JSDoc |
| Routing | React Router |
| Styling | CSS3 |
| Icons | Lucide React |
| State | React Context, `useReducer`, `useMemo`, custom hooks |
| Persistence | Browser `localStorage` |
| Testing | Vitest, Testing Library, Jest DOM |
| Linting | Oxlint |
| CI | GitHub Actions |

No external state-management package or application backend is required.

---

## Architecture

`TaskContext` is the application’s central state boundary. It combines task operations, persisted preferences, derived statistics, gamification state, and common feature data for page components.

```text
src/
├── components/    Reusable dashboard, task, navigation, and dialog UI
├── context/       TaskContext provider and context hooks
├── data/          Initial tasks and Focus Notes content
├── hooks/         State, persistence, task, and gamification hooks
├── pages/         Route-level productivity views
├── test/          Component and utility test suites
├── types/         JSDoc task definitions
└── utils/         Recurrence, habits, focus, assistant, and gamification logic
```

### State flow

1. `useTasks` initializes from validated browser storage.
2. Immutable reducer actions add, update, delete, bulk-delete, or complete tasks.
3. Recurring tasks create a separate future occurrence when completed.
4. `TaskContext` derives dashboard totals and filtered task collections.
5. Persistence hooks synchronize supported state after successful updates.
6. Route-level components consume the same state without separate stores.

### Persistence

The primary persisted task key is `focusboard_tasks`.

- Valid saved arrays restore normally
- An empty saved array remains a valid empty workspace
- Corrupt or invalid data falls back to sample tasks
- Duplicate task IDs are rejected
- Required task fields and supported status/priority values are validated

Other feature state uses purpose-specific localStorage keys for habits, focus sessions, trash, preferences, gamification, projects, and dashboard configuration.

---

## Routes

| Route | View |
|---|---|
| `/` | Dashboard |
| `/tasks` | My Tasks |
| `/projects` | Projects |
| `/kanban` | Kanban |
| `/calendar` | Calendar |
| `/habits` | Habit Tracker |
| `/focus` | Focus Timer |
| `/assistant` | Productivity Assistant |
| `/analytics` | Analytics |
| `/achievements` | Achievements |
| `/settings` | Settings |
| `/notes` | Focus Notes |
| `/eisenhower` | Eisenhower Matrix |
| `/goals` | Goals |
| `/inbox` | Quick Capture |
| `/mood` | Mood and Energy |
| `/deep-work` | Deep Work |
| `/weekly-review` | Weekly Review |
| `/workload` | Workload |

---

## Quick Start

### Requirements

- Node.js 20.19+ or Node.js 22+
- npm

### Installation

```bash
git clone https://github.com/Appireddy-Hemanth/mobile-Application.git
cd mobile-Application
npm install
npm run dev
```

Open the local URL printed by Vite, typically `http://localhost:5173`.

---

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run the complete Vitest suite |
| `npm run test:watch` | Start Vitest in watch mode |

---

## Testing

The test suite covers task creation and editing, validation, filtering, routing, localStorage restoration, recurrence, habits, gamification, focus-session records, and the dashboard.

```bash
npm test
npm run lint
npm run build
```

Vitest is configured for the jsdom environment with Testing Library and uses a single thread worker for reliable test startup.

---

## Production Deployment

Create a static production build:

```bash
npm run build
```

Deploy the generated `dist/` directory to a static host.

Because FocusBoard uses React Router paths, configure your host to rewrite application routes such as `/tasks` and `/kanban` to `index.html`.

No live URL is included until a deployment has been verified.

### Static host example

For GitHub Pages or another static host:

- Build from the repository root
- Publish the `dist/` directory
- Enable a fallback rewrite for `index.html`
- Use HashRouter or configure SPA rewrites if the host does not support direct route fallback

---

## Accessibility

The interface includes:

- Semantic route and section structure
- Labeled inputs and controls
- Dialog roles and modal labels
- Escape-key dismissal for task dialogs
- Focus restoration when dialogs close
- Visible keyboard focus states
- Screen-reader labels for icon-only actions
- Responsive navigation and layouts

---

## Scope and Limitations

- FocusBoard is a browser-local application, not a multi-user backend service
- Data is not synchronized across devices or browser profiles
- The assistant uses deterministic local rules, not an external model
- Notifications are generated from current frontend task and deadline state
- Layout fidelity is based on the implemented interface rather than a supplied, verified Figma source
- Clearing browser storage removes local application data

---

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a focused feature branch
3. Run lint, tests, and the production build
4. Open a pull request with a concise summary and screenshots for visual changes

Before submitting:

```bash
npm run lint
npm test
npm run build
```

---

## License

No license has been specified in this repository. Add a `LICENSE` file if you intend to make the project available for open-source reuse.

---

<div align="center">

Built with React, Vite, and a browser-first productivity approach.

</div>
