# jobnest

## 0.0.1

### Patch Changes

- 1ed97d1: Add an in-app settings screen for JobNest with appearance, application defaults, and data reset controls.

  Improve the application form by defaulting salary currencies from settings while still allowing expectation and offer values to use different currencies per field.

- ae347e0: Improve application list design and performance with grid layout and backend sorting.

  UI improvements:

  - Applications now display in a responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
  - Reduced card padding and improved whitespace for better readability
  - Added color-coded status badges for visual hierarchy (offer: green, interview: amber, applied: purple, saved: blue, rejected: red)
  - Better typography hierarchy with truncated titles and condensed secondary information
  - Improved hover states with subtle border and shadow effects

  Performance improvements:

  - Moved application sorting from client-side JavaScript to backend database query
  - Backend now sorts by status priority (offer → interview → applied → saved → rejected) with updated_at as tiebreaker
  - Removed unnecessary client-side sorting logic

- 78927fc: Add comprehensive export/import functionality for app data backup and restore.

  Features:

  - Backend: `export_app_data()` and `import_app_data()` database methods with atomic transactions
  - Tests: 4 integration tests for export/import operations (all passing)
  - UI: Export/Import buttons in Settings > Data section with native Tauri save dialog
  - CI/CD: GitHub Actions workflow now runs tests on every push
  - UX: Disabled autocorrect on job post URL input field

  Technical improvements:

  - Added missing model types: Task, Attachment, StageEvent
  - Created ExportData and ImportDataInput DTOs with version tracking
  - Proper Tauri v2 permissions and capabilities setup for file operations
  - Complete error handling and user feedback for all operations

- da4dbf1: Improve the desktop window chrome on macOS and reserve header space beneath the overlay titlebar.

  App updates:

  - Switched the Tauri macOS window to an overlay titlebar so the app content can render beneath the native controls
  - Moved main window creation into Rust to apply macOS-specific titlebar behavior safely
  - Added a shared top content inset so the app header no longer sits flush against the window edge

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

- e56a8fe: Refresh the JobNest app icon and update the in-app header to use the new transparent logo asset.

  Remember the desktop window size, position, and maximized state between launches for a more native Tauri app experience.

- Updated dependencies [407ea00]
- Updated dependencies [2acd5bc]
- Updated dependencies [6435557]
- Updated dependencies [a4382ab]
- Updated dependencies [a4382ab]
- Updated dependencies [c468258]
  - @jobnest/ui@0.0.1
