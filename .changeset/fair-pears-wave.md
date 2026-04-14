---
"jobnest": patch
---

Improve the desktop window chrome on macOS and reserve header space beneath the overlay titlebar.

App updates:
- Switched the Tauri macOS window to an overlay titlebar so the app content can render beneath the native controls
- Moved main window creation into Rust to apply macOS-specific titlebar behavior safely
- Added a shared top content inset so the app header no longer sits flush against the window edge
