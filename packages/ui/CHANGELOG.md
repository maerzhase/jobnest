# @jobnest/ui

## 0.0.5

### Patch Changes

- 3bdcd11: Add issue reporting from the Help menu and error notifications.

## 0.0.4

### Patch Changes

- 2333921: Make toggle group buttons feel like a single continuous control by aligning the selected segment shape with the outer border and matching shared control sizing more closely.
- 623f7f5: Add Checkbox and Combobox components, and align border radius across the design system.

  - New `Checkbox` component built on Base UI with checked/indeterminate/disabled states.
  - New `Combobox` component with multi-select chips, search filtering, keyboard navigation, and Backspace-to-remove behavior.
  - Date inputs now have themed text, separator, and focused-subfield colors with a proper focus ring on WebKit.
  - Toggle group buttons render as a continuous segmented control — only the first and last items get rounded outer corners.
  - Border radius unified to `rounded-md` across container surfaces (tabs indicator, toast, collapsible trigger) so controls feel visually consistent.

## 0.0.3

### Patch Changes

- 71aff55: Add search to the applications view with live matching in both list and kanban layouts.

  Matching applications now rise to the top as you type, matched text is highlighted more clearly inside cards, non-matching cards stay visible but dimmed, and matching list sections open automatically during search.

  Add a compact input size so header search fields can align with small view controls.

- b0b9714: Add a tabs component to the design system with an animated indicator for active states.

  Update the sidebar to use vertical tabs so navigation feels more distinct from primary actions.

## 0.0.2

### Patch Changes

- 39dcd1c: Feature: add application source to the tracked application form and show select labels correctly

  - Add the "How this role came in" field to the tracked application form.
  - Fix shared select rendering so closed triggers show the selected item label instead of the stored value.
  - Derive form enum validation from shared option lists to reduce duplication and drift risk.

- 168371c: - Buttons: add sizes + ghost variant \n ToggleGroup: add sizes variants \n Tokens: add surface design tokens
- e3175a2: Document and add Storybook coverage for the expanded UI component catalog.

  - Cover the implemented shared primitives: Button, Field, Input, Select, ToggleGroup, Collapsible, Dialog, AlertDialog, and Toast.
  - Add stories for the primary states and composition patterns used by Jobnest across those components.
  - Update the package README to point developers to Storybook and source exports as the stable places to inspect the current component surface.

- 9151ea5: Tokens: Use greyscale colors

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
