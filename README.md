# FocusBoard

A responsive, single-user task dashboard for planning work, tracking progress, and keeping a small set of priorities in focus.

**Live application:** [https://focusboard-dashboard-tan.vercel.app/](https://focusboard-dashboard-tan.vercel.app/)
**Source code:** [Appireddy-Hemanth/mobile-Application](https://github.com/Appireddy-Hemanth/mobile-Application)

## Features

- Six realistic sample tasks, loaded only when no saved task list exists
- Create and edit tasks with title validation, description, category, status, priority, and optional due date
- Delete tasks after confirmation
- Cycle task status from **To do** to **In progress** to **Completed**
- Combine case-insensitive title search, status tabs, and priority filtering
- Derived total, in-progress, completed, pending-task, and completion-percentage values
- Three-slide Focus Notes carousel with indicator, previous/next buttons, and arrow-key navigation
- Browser persistence using `localStorage`; a valid saved empty list is preserved
- Accessible labels, keyboard focus states, Escape-to-close dialogs, and responsive navigation
- Calendar and Settings are intentionally scoped placeholder states, not additional assessment screens

## Responsive layout

The interface adapts across the requested reference widths:

| Width | Layout |
|---|---|
| **1440px desktop** | 240px workspace sidebar, breadcrumb header, three-column statistics, task table |
| **768px tablet** | Compact icon sidebar, fluid dashboard cards and filters |
| **390px mobile** | Compact top header, two-column statistics, stacked task cards, fixed bottom navigation |

The Create/Edit Task dialog also adapts to narrow viewports without horizontal scrolling.

## Tech stack

- React 19 and Vite 8
- JavaScript with JSDoc
- Tailwind CSS 4 tooling, with focused component styling in CSS
- Lucide React icons
- React Context and a `useReducer` task store
- Vitest and Testing Library

## State and architecture

`TaskProvider` exposes the task state through React Context. The `useTasks` hook initializes the reducer from the `focusboard_tasks` localStorage key and all task mutations return new arrays/objects rather than modifying existing state. The dashboard calculates its statistics and combined search/status/priority result list from that shared task state.

When the key is absent, the six sample tasks initialize the workspace and are saved. Valid saved tasks—including an empty array—are restored on refresh rather than replaced. Invalid saved data is not silently replaced with samples on initial load. Task additions, edits, status changes, and confirmed deletions are persisted in the browser.

```text
src/
├── components/     Task rows, task dialog, confirmation dialog, Focus Notes carousel
├── context/        Task provider and context hook
├── data/           Initial tasks and carousel copy
├── hooks/          Reducer-backed task state and localStorage persistence
├── pages/          Dashboard composition
└── test/           Dashboard and utility tests
```

## Getting started

Requires Node.js 20.19+ or Node.js 22+ and npm.

```bash
git clone https://github.com/Appireddy-Hemanth/mobile-Application.git
cd mobile-Application
npm install
npm run dev
```

## Commands

```bash
npm run dev      # start the Vite development server
npm test         # run the Vitest suite
npm run lint     # run Oxlint
npm run build    # create the production bundle
npm run preview  # preview the production bundle locally
```

## Screenshots

### Desktop — 1440 × 1000

![FocusBoard dashboard at desktop width](./screenshots/desktop.png)

### Mobile — 390 × 1128

<div align="center">
  <img src="./screenshots/mobile.png" alt="FocusBoard dashboard at mobile width" width="390">
</div>

## Scope and limitations

- FocusBoard is frontend-only. Tasks are local to the current browser and are not synchronized across devices.
- Calendar and Settings navigation display scope-aligned placeholders.
- The Focus Notes carousel contains three curated slides; automatic rotation is not used.
- Task data is stored in browser `localStorage`; clearing site data removes the saved workspace.

## AI usage

AI assistance disclosure and representative prompts are documented in [AI_USAGE.md](./AI_USAGE.md).
