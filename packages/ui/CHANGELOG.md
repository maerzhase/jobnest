# @jobnest/ui

## 0.0.1

### Patch Changes

- 407ea00: Add visual feedback and validation indicators to form fields.

  - Add `required` prop to Field component to display asterisk (\*) on required fields
  - Add `invalid` prop to Input and SelectTriggerButton components for error state styling
  - Apply red border and ring colors to invalid inputs for clear visual feedback
  - Update application form to mark required fields and pass invalid state to inputs
  - Export `cn` utility from UI package for conditional styling support

- 2acd5bc: Add a minimal local-first application tracking flow backed by the Tauri SQLite store.

  Expose shared Base UI `Field` and `Input` primitives from the UI package for reuse across the workspace.

- 6435557: Add a shared Base UI `Select` component to the UI package and use it in the JobNest application form.

  Polish the select popup layering and dark-mode styling so it renders correctly above dialogs with a full-width option list.

- a4382ab: Add a kanban application tracker with drag-and-drop status updates and shared toggle controls.

  App updates:

  - Added a kanban board view alongside the existing applications list
  - Enabled drag-and-drop interactions for moving applications between status columns
  - Applied optimistic status updates with error recovery when moves fail
  - Added dedicated kanban columns with per-status counts and empty states
  - Expanded the tracker layout to better support full-width horizontal board scrolling

  UI package updates:

  - Added a reusable toggle group component for compact view-switching controls

- a4382ab: Polish the application tracker header controls and improve shared button icon spacing.

  App updates:

  - Refined the applications header layout so the title stays separate from the control cluster
  - Kept the add action grouped with the view toggles for a cleaner tracker toolbar
  - Added a clearer add icon to the application creation button

  UI package updates:

  - Added default spacing between button labels and SVG icons
  - Applied safer default SVG sizing and shrink behavior inside buttons
  - Tightened horizontal padding automatically when buttons include a direct child icon

- c468258: Add shared stacked toast notifications and use them across the app for success, warning, and error feedback.

  App updates:

  - Added a global toast manager and mounted the toast provider at the app shell level
  - Replaced inline settings and application action status banners with toast notifications
  - Added auto-dismiss timing for app toasts and expanded spacing when the toast stack unfolds

  UI package updates:

  - Added a reusable Base UI toast component with a shared stacked viewport renderer
  - Exported toast provider and toast manager helpers from `@jobnest/ui`
