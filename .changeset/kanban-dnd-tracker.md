---
"jobnest": patch
"@jobnest/ui": patch
---

Add a kanban application tracker with drag-and-drop status updates and shared toggle controls.

App updates:
- Added a kanban board view alongside the existing applications list
- Enabled drag-and-drop interactions for moving applications between status columns
- Applied optimistic status updates with error recovery when moves fail
- Added dedicated kanban columns with per-status counts and empty states
- Expanded the tracker layout to better support full-width horizontal board scrolling

UI package updates:
- Added a reusable toggle group component for compact view-switching controls
