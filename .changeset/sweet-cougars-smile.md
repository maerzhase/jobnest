---
"jobnest": patch
"@jobnest/ui": patch
---

Add shared stacked toast notifications and use them across the app for success, warning, and error feedback.

App updates:
- Added a global toast manager and mounted the toast provider at the app shell level
- Replaced inline settings and application action status banners with toast notifications
- Added auto-dismiss timing for app toasts and expanded spacing when the toast stack unfolds

UI package updates:
- Added a reusable Base UI toast component with a shared stacked viewport renderer
- Exported toast provider and toast manager helpers from `@jobnest/ui`
