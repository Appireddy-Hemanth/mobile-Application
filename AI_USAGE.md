# AI Usage Disclosure

## Tools used

- GitHub Copilot in VS Code

## Representative prompts

1. “Build a responsive FocusBoard task dashboard that matches the supplied desktop, tablet, and mobile requirements.”
2. “Use React Context and `useReducer` as the task source of truth, derive dashboard totals, and persist user changes in localStorage.”
3. “Implement accessible task creation, editing, status cycling, deletion confirmation, combined filters, and a keyboard-navigable three-slide carousel.”

## AI-assisted areas

- Dashboard layout, navigation, responsive styling, and Focus Notes carousel
- Task creation/editing and delete-confirmation interactions
- Reducer-backed local task persistence and derived dashboard data
- Focused component tests and project documentation

## Review and verification

The implementation was reviewed against the assessment requirements. A potential issue where malformed saved data could be replaced by sample tasks was corrected: sample data is seeded only when the task key is absent, and a valid saved empty list remains empty. The task form was also checked to ensure only the title is required, with due date optional. The automated test suite (19 tests), lint, and production build passed. Browser checks at 390px, 768px, and 1440px confirmed the responsive navigation and no horizontal overflow; keyboard navigation and mobile control sizes were checked as well.
